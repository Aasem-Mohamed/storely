"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
} from "react-icons/hi2";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", emoji: "🔌" },
  { name: "Clothing", slug: "clothing", emoji: "👕" },
  { name: "Home & Kitchen", slug: "home & kitchen", emoji: "🏠" },
  { name: "Sports", slug: "sports", emoji: "⚽" },
  { name: "Food & Beverages", slug: "food & beverages", emoji: "🍵" },
  { name: "Accessories", slug: "accessories", emoji: "👜" },
];

const FEATURES = [
  {
    icon: HiOutlineTruck,
    title: "Free Shipping",
    desc: "On orders over EGP 500",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Secure Payment",
    desc: "Your data is protected",
  },
  {
    icon: HiOutlineCreditCard,
    title: "Flexible Payment",
    desc: "Card or Cash on Delivery",
  },
  {
    icon: HiOutlineSparkles,
    title: "Quality Guarantee",
    desc: "Curated with care",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=4&sortBy=createdAt&sortOrder=desc");
        const data = await res.json();
        if (!cancelled && data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // Retry once after a short delay (handles cold-start compilation)
        if (!cancelled) {
          setTimeout(async () => {
            try {
              const res = await fetch("/api/products?limit=4&sortBy=createdAt&sortOrder=desc");
              const data = await res.json();
              if (!cancelled && data.success) {
                setProducts(data.products);
              }
            } catch (retryErr) {
              console.error("Retry also failed:", retryErr);
            }
          }, 1500);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="animate-rise">
      {/* ══════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge badge-outline badge-lg mb-6 font-medium tracking-wider text-xs uppercase animate-slide-up">
              New Season — Spring 2026
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6 animate-slide-up stagger-1">
              Considered goods
              <br />
              <span className="text-base-content/40">for everyday life</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/60 mb-10 max-w-xl mx-auto leading-relaxed animate-slide-up stagger-2">
              Carefully curated products that blend quality craftsmanship with
              modern design. Built to last, priced to love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3">
              <Link
                href="/store"
                className="btn btn-primary btn-lg gap-2 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Shop Now
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/store"
                className="btn btn-outline btn-lg px-8"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES BAR
          ══════════════════════════════════════════ */}
      <section className="border-y border-base-200 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-base-200">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 py-6 px-4 lg:px-6"
              >
                <feature.icon className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-base-content/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
          ══════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight">
              Featured Products
            </h2>
            <p className="text-base-content/50 mt-2">
              Our latest arrivals, handpicked for you
            </p>
          </div>
          <Link
            href="/store"
            className="btn btn-ghost btn-sm gap-1 hidden sm:flex"
          >
            View all
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-sm">
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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product._id} className={`animate-slide-up stagger-${i + 1}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-base-content/40 text-lg">No products found.</p>
            <p className="text-base-content/30 text-sm mt-1">
              Check back soon for new arrivals!
            </p>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/store" className="btn btn-outline gap-2">
            View all products
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES
          ══════════════════════════════════════════ */}
      <section className="bg-base-200/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight">
              Shop by Category
            </h2>
            <p className="text-base-content/50 mt-2">
              Find exactly what you&apos;re looking for
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/store?category=${encodeURIComponent(cat.slug)}`}
                className="group bg-base-100 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-base-200"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
          ══════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="bg-primary text-primary-content rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-medium tracking-tight mb-4">
              Ready to discover?
            </h2>
            <p className="text-primary-content/70 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of happy customers who trust Storely for quality,
              everyday essentials.
            </p>
            <Link
              href="/store"
              className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 gap-2 shadow-lg"
            >
              Start Shopping
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
