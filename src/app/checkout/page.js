"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineCheckCircle, HiOutlineCreditCard, HiOutlineBanknotes, HiOutlineShoppingBag, HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, fetchCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [checkoutAllowed, setCheckoutAllowed] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Auth + Cart-only access guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/cart");
        return;
      }

      // Check if user came from cart page
      const allowed = sessionStorage.getItem("storely_checkout_allowed");
      if (!allowed) {
        router.push("/cart");
        return;
      }

      setCheckoutAllowed(true);

      // Pre-fill form with user data
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            street: form.street,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Clear the checkout flag
        sessionStorage.removeItem("storely_checkout_allowed");
        setOrderData(data.order);
        setOrderPlaced(true);
        // Refresh cart state
        await fetchCart();
      } else {
        setCheckoutError(data.message || "Something went wrong");
        if (data.errors) {
          setCheckoutError(data.errors.join(". "));
        }
      }
    } catch (err) {
      setCheckoutError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Show loader while checking access
  if (authLoading || !checkoutAllowed) {
    if (orderPlaced) {
      // Allow rendering the success state even after flag is cleared
    } else {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }
  }

  // Success State
  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-rise">
        <div className="text-center max-w-md">
          {/* Confetti dots */}
          <div className="relative mb-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  backgroundColor: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#14b8a6"][i % 5],
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              />
            ))}
            <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <HiOutlineCheckCircle className="w-14 h-14 text-success" />
            </div>
          </div>

          <h1 className="text-3xl font-medium tracking-tight mb-3">Order Placed!</h1>
          <p className="text-base-content/60 mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-sm text-base-content/40 mb-8">
            Order #{orderData?.orderId || "..."} • {paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/store" className="btn btn-primary gap-2">
              <HiOutlineShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
            <Link href="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-rise">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-medium mb-3">Your cart is empty</h1>
        <p className="text-base-content/50 mb-6">Add items before checking out</p>
        <Link href="/store" className="btn btn-primary">Go to Store</Link>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">Checkout</h1>
          <p className="text-base-content/50 mt-1">Complete your order</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {checkoutError && (
          <div className="alert alert-error mb-6 shadow-sm">
            <HiOutlineExclamationTriangle className="w-5 h-5" />
            <span className="text-sm">{checkoutError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left — Forms */}
            <div className="flex-1 space-y-8">
              {/* Shipping Info */}
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">Full Name</span></label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required className="input input-bordered w-full" placeholder="John Doe" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">Email</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required className="input input-bordered w-full" placeholder="john@example.com" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">Phone</span></label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="input input-bordered w-full" placeholder="+20 123 456 7890" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">Street Address</span></label>
                      <input type="text" name="street" value={form.street} onChange={handleChange} required className="input input-bordered w-full" placeholder="123 Main St" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">City</span></label>
                      <input type="text" name="city" value={form.city} onChange={handleChange} required className="input input-bordered w-full" placeholder="Cairo" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-sm font-medium">Zip Code</span></label>
                      <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} className="input input-bordered w-full" placeholder="11511" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`card border-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-base-200"}`}>
                      <div className="card-body p-4 flex-row items-center gap-3">
                        <input type="radio" name="payment" className="radio radio-primary radio-sm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                        <HiOutlineBanknotes className="w-6 h-6 text-success" />
                        <div>
                          <p className="font-semibold text-sm">Cash on Delivery</p>
                          <p className="text-xs text-base-content/50">Pay when you receive</p>
                        </div>
                      </div>
                    </label>
                    <label className={`card border-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-base-200"}`}>
                      <div className="card-body p-4 flex-row items-center gap-3">
                        <input type="radio" name="payment" className="radio radio-primary radio-sm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                        <HiOutlineCreditCard className="w-6 h-6 text-info" />
                        <div>
                          <p className="font-semibold text-sm">Credit Card</p>
                          <p className="text-xs text-base-content/50">Visa, Mastercard</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-6 p-4 bg-base-200/50 rounded-xl space-y-4">
                      <div className="form-control">
                        <label className="label"><span className="label-text text-sm font-medium">Card Number</span></label>
                        <input type="text" className="input input-bordered w-full" placeholder="4242 4242 4242 4242" maxLength={19} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label"><span className="label-text text-sm font-medium">Expiry</span></label>
                          <input type="text" className="input input-bordered w-full" placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div className="form-control">
                          <label className="label"><span className="label-text text-sm font-medium">CVV</span></label>
                          <input type="text" className="input input-bordered w-full" placeholder="123" maxLength={4} />
                        </div>
                      </div>
                      <p className="text-xs text-warning">⚠ This is a demo — no real payment will be processed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:w-80 shrink-0">
              <div className="card bg-base-100 shadow-sm border border-base-200 sticky top-24">
                <div className="card-body p-6">
                  <h2 className="card-title text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between text-base-content/70">
                        <span className="line-clamp-1 flex-1 mr-2">{item.product?.name} × {item.quantity}</span>
                        <span className="shrink-0">EGP {((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="divider my-3"></div>
                  <div className="flex justify-between text-sm text-base-content/60">
                    <span>Subtotal</span><span>EGP {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-base-content/60">
                    <span>Shipping</span><span className="text-success font-medium">Free</span>
                  </div>
                  <div className="divider my-3"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span><span>EGP {cartTotal.toLocaleString()}</span>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-4" disabled={placing}>
                    {placing ? (
                      <><span className="loading loading-spinner loading-sm"></span>Processing...</>
                    ) : (
                      `Place Order — EGP ${cartTotal.toLocaleString()}`
                    )}
                  </button>

                  <Link href="/cart" className="btn btn-ghost btn-sm w-full mt-2">← Back to Cart</Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
