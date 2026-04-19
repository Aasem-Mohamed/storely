"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "seller") router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "seller") {
    return <div className="text-center mt-10">Loading Seller Portal...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Seller Portal</h1>
      <p>Welcome to your seller dashboard, {user.name}.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 border rounded">My Products</div>
        <div className="bg-gray-100 p-4 border rounded">New Orders</div>
      </div>
    </div>
  );
}
