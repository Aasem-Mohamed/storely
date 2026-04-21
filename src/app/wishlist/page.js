"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { HiOutlineHeart, HiOutlineShoppingBag } from "react-icons/hi2";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { wishlist, loading, fetchWishlist } = useWishlist();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/wishlist");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      {/* Header */}
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineHeart className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl lg:text-5xl font-medium tracking-tight">My Wishlist</h1>
          </div>
          <p className="text-base-content/50 text-lg">
            {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-sm border border-base-200">
                <div className="skeleton aspect-square w-full rounded-b-none"></div>
                <div className="card-body p-4 gap-3">
                  <div className="skeleton h-3 w-20"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-3 w-3/4"></div>
                  <div className="flex justify-between mt-2">
                    <div className="skeleton h-6 w-24"></div>
                    <div className="skeleton h-8 w-20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product, i) => (
              <div key={product._id} className={`animate-slide-up stagger-${Math.min(i + 1, 4)}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-6">
              <HiOutlineHeart className="w-12 h-12 text-base-content/30" />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-base-content/50 mb-8 max-w-sm mx-auto">
              Start adding products you love by clicking the heart icon on any product.
            </p>
            <Link href="/store" className="btn btn-primary btn-lg gap-2">
              <HiOutlineShoppingBag className="w-5 h-5" />
              Browse Store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
