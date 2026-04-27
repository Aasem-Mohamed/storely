"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineArrowRight,
  HiOutlineChartBarSquare,
} from "react-icons/hi2";

export default function SellerOverview() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "seller") router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/seller/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Fetch stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchRecentOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecentOrders(data.orders.slice(0, 5));
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "seller" && token) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [user, token, fetchStats, fetchRecentOrders]);

  if (authLoading || !user || user.role !== "seller") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: HiOutlineArchiveBox, color: "bg-indigo-500/10", iconColor: "text-indigo-600" },
    { label: "Active", value: stats.activeProducts, icon: HiOutlineCheck, color: "bg-green-500/10", iconColor: "text-green-600" },
    { label: "Out of Stock", value: stats.outOfStock, icon: HiOutlineExclamationTriangle, color: "bg-red-500/10", iconColor: "text-red-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: HiOutlineClipboardDocumentList, color: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Revenue", value: `EGP ${stats.totalRevenue?.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: "bg-amber-500/10", iconColor: "text-amber-600" },
  ];

  const getStatusColor = (status) => {
    const map = { confirmed: "badge-info", processing: "badge-warning", shipped: "badge-accent", delivered: "badge-success", cancelled: "badge-error" };
    return map[status] || "badge-ghost";
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HiOutlineChartBarSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">Welcome back, {user.name}</h1>
              <p className="text-base-content/50 mt-0.5">Here&apos;s an overview of your store</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4 flex-row items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight">
                    {statsLoading ? <span className="loading loading-dots loading-xs"></span> : s.value}
                  </p>
                  <p className="text-[10px] text-base-content/50 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <h2 className="card-title text-lg mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/seller/products" className="btn btn-primary w-full justify-between">
                  Manage Products <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/seller/orders" className="btn btn-outline w-full justify-between">
                  View All Orders <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card bg-base-100 shadow-sm border border-base-200 lg:col-span-2">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-lg">Recent Orders</h2>
                <Link href="/seller/orders" className="btn btn-ghost btn-sm gap-1">
                  View all <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><span className="loading loading-spinner loading-md"></span></div>
              ) : recentOrders.length === 0 ? (
                <p className="text-center py-8 text-base-content/40">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-base-200/50">
                        <th className="text-xs uppercase tracking-wider">Order</th>
                        <th className="text-xs uppercase tracking-wider">Customer</th>
                        <th className="text-xs uppercase tracking-wider">Amount</th>
                        <th className="text-xs uppercase tracking-wider">Status</th>
                        <th className="text-xs uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-base-200/30">
                          <td className="font-mono text-xs">{order.orderId}</td>
                          <td className="text-sm">{order.shippingAddress?.name || order.user?.name || "N/A"}</td>
                          <td className="text-sm font-medium">EGP {order.sellerTotal?.toLocaleString()}</td>
                          <td><span className={`badge badge-sm capitalize ${getStatusColor(order.status)}`}>{order.status}</span></td>
                          <td className="text-xs text-base-content/50">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
