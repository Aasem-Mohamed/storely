"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SellerProducts from "@/components/SellerProducts";

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "seller") router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== "seller") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">My Products</h1>
          <p className="text-base-content/50 mt-1">Manage your product listings</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        <SellerProducts />
      </div>
    </div>
  );
}
