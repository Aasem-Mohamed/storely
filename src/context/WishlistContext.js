"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const wishlistCount = wishlist.length;

  // Check if a product is in the wishlist
  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item._id === productId),
    [wishlist]
  );

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist", { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  // Fetch on login
  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, token, fetchWishlist]);

  // Toggle wishlist (add/remove)
  const toggleWishlist = async (product) => {
    if (!user || !token) return { success: false, needsLogin: true };

    const productId = product._id;
    const alreadyIn = isInWishlist(productId);

    try {
      if (alreadyIn) {
        // Optimistic removal
        setWishlist((prev) => prev.filter((item) => item._id !== productId));

        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: authHeaders(),
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (!data.success) {
          // Revert on failure
          setWishlist((prev) => [...prev, product]);
        }
        return { success: true, added: false };
      } else {
        // Optimistic add
        setWishlist((prev) => [...prev, product]);

        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (!data.success) {
          // Revert on failure
          setWishlist((prev) => prev.filter((item) => item._id !== productId));
        }
        return { success: true, added: true };
      }
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      // Revert optimistic update
      if (alreadyIn) {
        setWishlist((prev) => [...prev, product]);
      } else {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
      }
      return { success: false };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
