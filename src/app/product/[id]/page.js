"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
} from "react-icons/hi2";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        setError(data.message || "Product not found");
      }
    } catch (err) {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (cartLoading || !product || product.stock === 0) return;
    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    setCartLoading(true);
    await addToCart(product, quantity);
    setCartLoading(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    await toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    if (!reviewRating || !reviewComment.trim()) {
      setReviewError("Please provide both a rating and comment");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(data.message);
        setReviewRating(0);
        setReviewComment("");
        // Refresh product to get updated reviews
        await fetchProduct();
      } else {
        setReviewError(data.message);
      }
    } catch (err) {
      setReviewError("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? (product.images.length - 1) : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Error
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-medium mb-2">Product Not Found</h1>
          <p className="text-base-content/50 mb-6">{error || "This product doesn't exist or has been removed."}</p>
          <Link href="/store" className="btn btn-primary gap-2">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [`https://placehold.co/600x600/f5f5f4/a8a29e?text=${encodeURIComponent(product.name?.split(" ")[0] || "Product")}`];

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const wishlisted = isInWishlist(product._id);

  return (
    <div className="animate-rise">
      {/* Breadcrumb */}
      <div className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/store">Store</Link></li>
              <li className="text-base-content/50 capitalize">{product.category}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ══════ LEFT — Image Gallery ══════ */}
          <div className="lg:w-[55%] shrink-0">
            {/* Main Image */}
            <div className="relative aspect-square bg-base-200/50 rounded-2xl overflow-hidden group">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Wishlist button */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm border-0 shadow-md hover:bg-base-100 z-10"
              >
                {wishlisted ? (
                  <HiHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-5 h-5" />
                )}
              </button>

              {/* Out of stock overlay */}
              {!inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="badge badge-lg badge-error text-white font-semibold text-lg px-6 py-4">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Navigation arrows (only if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm border-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm border-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === currentImage
                          ? "bg-primary w-6"
                          : "bg-base-100/60 hover:bg-base-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === currentImage
                        ? "border-primary shadow-md"
                        : "border-base-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══════ RIGHT — Product Info ══════ */}
          <div className="flex-1 lg:py-2">
            {/* Category */}
            <span className="badge badge-outline capitalize text-xs tracking-wider mb-3">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl lg:text-4xl font-medium tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? "text-amber-400"
                        : "text-base-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-base-content/60">
                {product.averageRating?.toFixed(1) || "0.0"} ({product.numReviews || 0} review{product.numReviews !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight">
                EGP {product.price?.toLocaleString()}
              </span>
            </div>

            {/* Stock status */}
            <div className="mb-6">
              {!inStock ? (
                <div className="flex items-center gap-2 text-error">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              ) : lowStock ? (
                <div className="flex items-center gap-2 text-warning">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
                  <span className="text-sm font-medium">Only {product.stock} left in stock — order soon!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  <span className="text-sm font-medium">{product.stock} in stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Quantity selector */}
              <div className="join border border-base-300">
                <button
                  className="join-item btn btn-sm px-3"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !inStock}
                >
                  <HiOutlineMinus className="w-4 h-4" />
                </button>
                <span className="join-item btn btn-sm no-animation pointer-events-none min-w-12 font-semibold">
                  {quantity}
                </span>
                <button
                  className="join-item btn btn-sm px-3"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || !inStock}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
                className={`btn flex-1 gap-2 transition-all duration-300 ${
                  addedToCart ? "btn-success text-white" : "btn-primary"
                }`}
              >
                {addedToCart ? (
                  <>
                    <HiCheck className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : cartLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <HiOutlineShoppingBag className="w-5 h-5" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </button>

              {/* Wishlist button (mobile-friendly) */}
              <button
                onClick={handleWishlistToggle}
                className={`btn btn-outline gap-2 ${wishlisted ? "btn-error" : ""}`}
              >
                {wishlisted ? (
                  <HiHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{wishlisted ? "Wishlisted" : "Wishlist"}</span>
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 py-6 border-y border-base-200">
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <HiOutlineTruck className="w-5 h-5 text-primary shrink-0" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <HiOutlineShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <HiOutlineArrowPath className="w-5 h-5 text-primary shrink-0" />
                <span>Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-base-content/70 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="mt-6 p-4 bg-base-200/50 rounded-xl">
                <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">Sold by</p>
                <p className="text-sm font-semibold">{product.seller.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════ REVIEWS SECTION ══════ */}
        <div className="mt-16 lg:mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight">
              Customer Reviews
            </h2>
            <span className="badge badge-lg badge-outline">
              {product.numReviews || 0}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Review Form */}
            <div className="lg:w-96 shrink-0">
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {user ? "Write a Review" : "Login to Review"}
                  </h3>

                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Star rating input */}
                      <div>
                        <label className="label pb-1">
                          <span className="label-text font-medium">Your Rating</span>
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <HiStar
                                className={`w-8 h-8 transition-colors ${
                                  star <= (reviewHover || reviewRating)
                                    ? "text-amber-400"
                                    : "text-base-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium">Your Review</span>
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="textarea textarea-bordered w-full min-h-[100px]"
                          maxLength={500}
                        />
                        <label className="label py-1">
                          <span className="label-text-alt text-base-content/40">{reviewComment.length}/500</span>
                        </label>
                      </div>

                      {reviewError && (
                        <div className="text-error text-sm">{reviewError}</div>
                      )}
                      {reviewSuccess && (
                        <div className="text-success text-sm">{reviewSuccess}</div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewLoading || !reviewRating || !reviewComment.trim()}
                        className="btn btn-primary w-full"
                      >
                        {reviewLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          "Submit Review"
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-base-content/50 mb-4 text-sm">
                        You need to be logged in to leave a review.
                      </p>
                      <Link
                        href={`/login?redirect=/product/${id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Login to Review
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div className="flex-1">
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((review, index) => (
                    <div
                      key={review._id || index}
                      className="card bg-base-100 shadow-sm border border-base-200"
                    >
                      <div className="card-body p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {(review.name || review.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {review.name || review.user?.name || "Anonymous"}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <HiStar
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= review.rating
                                        ? "text-amber-400"
                                        : "text-base-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.createdAt && (
                            <span className="text-xs text-base-content/40">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-base-content/70 text-sm mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-1">No reviews yet</h3>
                  <p className="text-base-content/50 text-sm">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
