"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  HiOutlineShoppingBag,
  HiCheck,
  HiStar,
  HiOutlineHeart,
  HiHeart,
} from "react-icons/hi2";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || product.stock === 0) return;

    // If user is not logged in, redirect to login with return URL
    if (!user) {
      router.push("/login?redirect=/store");
      return;
    }

    setLoading(true);
    await addToCart(product, 1);
    setLoading(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login?redirect=/store");
      return;
    }

    await toggleWishlist(product);
  };

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : `https://placehold.co/400x400/f5f5f4/a8a29e?text=${encodeURIComponent(product.name?.split(" ")[0] || "Product")}`;

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const wishlisted = isInWishlist(product._id);

  return (
    <Link href={`/product/${product._id}`} className="block">
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        {/* Image */}
        <figure className="relative overflow-hidden bg-base-200/50 aspect-square">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 left-3 btn btn-circle btn-xs bg-base-100/80 backdrop-blur-sm border-0 shadow-sm hover:bg-base-100 z-10 transition-all"
          >
            {wishlisted ? (
              <HiHeart className="w-4 h-4 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-4 h-4" />
            )}
          </button>

          {/* Stock badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="badge badge-lg badge-error text-white font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          {lowStock && (
            <div className="absolute bottom-3 left-3">
              <span className="badge badge-warning badge-sm font-medium">
                Only {product.stock} left
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span className="badge badge-sm bg-base-100/80 backdrop-blur-sm capitalize text-xs font-medium">
              {product.category}
            </span>
          </div>
        </figure>

        {/* Content */}
        <div className="card-body p-4 gap-2">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(product.averageRating || 0)
                      ? "text-amber-400"
                      : "text-base-300"
                  }`}
                />
              ))}
            </div>
            {product.numReviews > 0 && (
              <span className="text-xs text-base-content/50">
                ({product.numReviews})
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="card-title text-sm font-semibold leading-tight line-clamp-2 font-[var(--font-sans)]">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price + Add to cart */}
          <div className="card-actions justify-between items-center mt-2 pt-2 border-t border-base-200">
            <div>
              <span className="text-lg font-bold tracking-tight">
                EGP {product.price?.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock || loading}
              className={`btn btn-sm gap-1.5 min-w-[100px] transition-all duration-300 ${
                added
                  ? "btn-success text-white"
                  : "btn-primary"
              }`}
            >
              {added ? (
                <>
                  <HiCheck className="w-4 h-4" />
                  Added
                </>
              ) : loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <HiOutlineShoppingBag className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
