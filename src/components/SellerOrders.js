"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from "react-icons/hi2";

export default function SellerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Fetch seller orders error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token, fetchOrders]);

  const getStatusColor = (status) => {
    const map = {
      confirmed: "badge-info",
      processing: "badge-warning",
      shipped: "badge-accent",
      delivered: "badge-success",
      cancelled: "badge-error",
    };
    return map[status] || "badge-ghost";
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
          <HiOutlineClipboardDocumentList className="w-10 h-10 text-base-content/30" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
        <p className="text-base-content/50">
          When customers purchase your products, orders will appear here
        </p>
      </div>
    );
  }

  return (
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
              <span className={`badge badge-sm capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-base-content/50">
              {formatDate(order.createdAt)}
            </div>
          </div>

          <div className="card-body p-6">
            {/* Customer Info */}
            <div className="bg-base-200/30 rounded-xl p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-base-content/40 mb-2 font-semibold">
                Customer Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <HiOutlineEnvelope className="w-4 h-4 text-base-content/40" />
                  <span>{order.shippingAddress?.name || order.user?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlinePhone className="w-4 h-4 text-base-content/40" />
                  <span>{order.shippingAddress?.phone || order.user?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineMapPin className="w-4 h-4 text-base-content/40" />
                  <span>
                    {[order.shippingAddress?.street, order.shippingAddress?.city]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const img = item.product?.images?.[0] ||
                  `https://placehold.co/48x48/f5f5f4/a8a29e?text=${(item.name || "P").charAt(0)}`;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-lg">
                        <img src={img} alt={item.name} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-base-content/50">
                        Qty: {item.quantity} × EGP {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      EGP {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divider my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-base-content/50 capitalize">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
              </span>
              <span className="text-lg font-bold">
                EGP {order.sellerTotal?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
