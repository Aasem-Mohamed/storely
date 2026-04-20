"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingBag, HiOutlineArrowRight } from "react-icons/hi2";

export default function CartPage() {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-rise">
        <div className="max-w-md mx-auto">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-medium tracking-tight mb-3">Your cart is empty</h1>
          <p className="text-base-content/50 mb-8">Looks like you haven&apos;t added anything yet. Start exploring our collection!</p>
          <Link href="/store" className="btn btn-primary btn-lg gap-2">
            <HiOutlineShoppingBag className="w-5 h-5" />
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">Shopping Cart</h1>
          <p className="text-base-content/50 mt-1">{cartCount} item{cartCount !== 1 ? "s" : ""} in your cart</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex justify-end mb-4">
              <button onClick={clearCart} className="btn btn-ghost btn-sm text-error gap-1">
                <HiOutlineTrash className="w-4 h-4" />Clear Cart
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {cart.map((item) => {
                const product = item.product;
                const imageUrl = product?.images?.[0] || `https://placehold.co/120x120/f5f5f4/a8a29e?text=Item`;
                return (
                  <div key={item.productId} className="card card-side bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
                    <figure className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-base-200/50">
                      <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                    </figure>
                    <div className="card-body p-4 sm:p-5 gap-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{product?.name}</h3>
                          <p className="text-xs text-base-content/50 capitalize">{product?.category}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="btn btn-ghost btn-xs btn-circle text-error">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="join border border-base-300">
                          <button className="join-item btn btn-xs btn-ghost" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}>
                            <HiOutlineMinus className="w-3 h-3" />
                          </button>
                          <span className="join-item btn btn-xs btn-ghost no-animation pointer-events-none min-w-8 font-semibold">{item.quantity}</span>
                          <button className="join-item btn btn-xs btn-ghost" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= (product?.stock || 99)}>
                            <HiOutlinePlus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-sm sm:text-base">
                          EGP {((product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Link href="/store" className="btn btn-ghost btn-sm gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="card bg-base-100 shadow-sm border border-base-200 sticky top-24">
              <div className="card-body p-6">
                <h2 className="card-title text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-base-content/70">
                      <span className="line-clamp-1 flex-1 mr-2">{item.product?.name} × {item.quantity}</span>
                      <span className="shrink-0">EGP {((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="divider my-3"></div>

                <div className="flex justify-between text-sm text-base-content/60">
                  <span>Subtotal</span>
                  <span>EGP {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-base-content/60">
                  <span>Shipping</span>
                  <span className="text-success font-medium">Free</span>
                </div>

                <div className="divider my-3"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>EGP {cartTotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="btn btn-primary w-full mt-4 gap-2">
                  Checkout
                  <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
