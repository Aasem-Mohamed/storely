"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  HiOutlineShoppingBag,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/orders");
        return;
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "badge-info";
      case "processing":
        return "badge-warning";
      case "shipped":
        return "badge-accent";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-rise">
      {/* Header */}
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">
            My Orders
          </h1>
          <p className="text-base-content/50 mt-1">
            Track and view your order history
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardDocumentList className="w-10 h-10 text-base-content/30" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-base-content/50 mb-6">
              When you place an order, it will appear here
            </p>
            <Link href="/store" className="btn btn-primary gap-2">
              <HiOutlineShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-base-200/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-semibold text-sm">
                      {order.orderId}
                    </span>
                    <span
                      className={`badge badge-sm capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-base-content/50">
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="card-body p-6">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => {
                      const img =
                        item.product?.images?.[0] ||
                        `https://placehold.co/48x48/f5f5f4/a8a29e?text=${(
                          item.name || "P"
                        ).charAt(0)}`;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4"
                        >
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-lg">
                              <img src={img} alt={item.name} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-base-content/50">
                              Qty: {item.quantity} × EGP{" "}
                              {item.price?.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-sm font-medium shrink-0">
                            EGP{" "}
                            {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="divider my-3"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-sm text-base-content/50">
                      <span className="capitalize">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Credit Card"}
                      </span>
                      {order.shippingAddress?.city && (
                        <span>
                          {" "}
                          • Shipping to {order.shippingAddress.city}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      Total: EGP {order.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
