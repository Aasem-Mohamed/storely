"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Basic client-side protection
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="text-center mt-10">Loading Admin Portal...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin panel, {user.name}.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 border rounded">Users Manager</div>
        <div className="bg-gray-100 p-4 border rounded">Products Approvals</div>
        <div className="bg-gray-100 p-4 border rounded">Order Tracking</div>
      </div>
    </div>
  );
}
