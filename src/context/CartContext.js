"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const CART_STORAGE_KEY = "storely_cart";

function getLocalCart() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Calculate totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // ── Fetch cart from API (logged-in users) ──
  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/cart", { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setCart(
          data.cart.items.map((item) => ({
            productId: item.product._id,
            product: item.product,
            quantity: item.quantity,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  // ── Sync on login: merge local cart → API, then fetch ──
  useEffect(() => {
    if (user && token) {
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        // Merge each local item into server cart
        Promise.all(
          localItems.map((item) =>
            fetch("/api/cart", {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity,
              }),
            })
          )
        ).then(() => {
          localStorage.removeItem(CART_STORAGE_KEY);
          fetchCart();
        });
      } else {
        fetchCart();
      }
    } else if (!user) {
      // Load from localStorage for guests
      setCart(getLocalCart());
    }
  }, [user, token, fetchCart, authHeaders]);

  // ── Add to cart ──
  const addToCart = async (product, quantity = 1) => {
    if (user && token) {
      // API call
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ productId: product._id, quantity }),
        });
        const data = await res.json();
        if (data.success) {
          setCart(
            data.cart.items.map((item) => ({
              productId: item.product._id,
              product: item.product,
              quantity: item.quantity,
            }))
          );
        }
        return data;
      } catch (err) {
        console.error("Add to cart error:", err);
        return { success: false };
      }
    } else {
      // Guest: localStorage
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product._id);
        let updated;
        if (existing) {
          updated = prev.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updated = [
            ...prev,
            {
              productId: product._id,
              product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
                stock: product.stock,
                category: product.category,
              },
              quantity,
            },
          ];
        }
        setLocalCart(updated);
        return updated;
      });
      return { success: true };
    }
  };

  // ── Update quantity ──
  const updateQuantity = async (productId, quantity) => {
    if (user && token) {
      try {
        const res = await fetch(`/api/cart/${productId}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ quantity }),
        });
        const data = await res.json();
        if (data.success) {
          if (quantity === 0) {
            setCart((prev) => prev.filter((item) => item.productId !== productId));
          } else {
            setCart(
              data.cart.items.map((item) => ({
                productId: item.product._id,
                product: item.product,
                quantity: item.quantity,
              }))
            );
          }
        }
        return data;
      } catch (err) {
        console.error("Update quantity error:", err);
        return { success: false };
      }
    } else {
      setCart((prev) => {
        let updated;
        if (quantity === 0) {
          updated = prev.filter((item) => item.productId !== productId);
        } else {
          updated = prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );
        }
        setLocalCart(updated);
        return updated;
      });
      return { success: true };
    }
  };

  // ── Remove from cart ──
  const removeFromCart = async (productId) => {
    if (user && token) {
      try {
        const res = await fetch(`/api/cart/${productId}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setCart(
            data.cart.items.map((item) => ({
              productId: item.product._id,
              product: item.product,
              quantity: item.quantity,
            }))
          );
        }
        return data;
      } catch (err) {
        console.error("Remove from cart error:", err);
        return { success: false };
      }
    } else {
      setCart((prev) => {
        const updated = prev.filter((item) => item.productId !== productId);
        setLocalCart(updated);
        return updated;
      });
      return { success: true };
    }
  };

  // ── Clear cart ──
  const clearCart = async () => {
    if (user && token) {
      try {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setCart([]);
        }
        return data;
      } catch (err) {
        console.error("Clear cart error:", err);
        return { success: false };
      }
    } else {
      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      return { success: true };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
