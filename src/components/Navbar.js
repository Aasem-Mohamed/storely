"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineBars3,
  HiXMark,
  HiOutlineHeart,
} from "react-icons/hi2";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/store", label: "Store" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push("/login?redirect=/cart");
    }
  };

  const handleWishlistClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push("/login?redirect=/wishlist");
    }
  };

  return (
    <>
      <nav className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 px-4 lg:px-8">
        {/* ── Left: Logo + Hamburger ── */}
        <div className="navbar-start">
          {/* Mobile hamburger */}
          <button
            className="btn btn-ghost btn-sm lg:hidden mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
          </button>

          <Link
            href="/"
            className="text-xl font-bold tracking-tight font-[var(--font-display)] hover:opacity-80 transition-opacity"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Storely
          </Link>
        </div>

        {/* ── Center: Nav links (desktop) ── */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "active bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!loading && user?.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className={`rounded-lg transition-colors ${
                    isActive("/admin")
                      ? "active bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  Admin
                </Link>
              </li>
            )}
            {!loading && user?.role === "seller" && (
              <li>
                <Link
                  href="/seller"
                  className={`rounded-lg transition-colors ${
                    isActive("/seller")
                      ? "active bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  Seller Portal
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* ── Right: Wishlist + Cart + User ── */}
        <div className="navbar-end gap-1">
          {/* Wishlist icon with badge */}
          <Link
            href="/wishlist"
            onClick={handleWishlistClick}
            className={`btn btn-ghost btn-circle relative ${isActive("/wishlist") ? "bg-base-200" : ""}`}
          >
            <HiOutlineHeart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="badge badge-sm badge-error absolute -top-1 -right-1 text-xs min-w-5 h-5 text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart icon with badge */}
          <Link
            href="/cart"
            onClick={handleCartClick}
            className={`btn btn-ghost btn-circle relative ${isActive("/cart") ? "bg-base-200" : ""}`}
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="badge badge-sm badge-primary absolute -top-1 -right-1 text-xs min-w-5 h-5 animate-badge-pop">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User area */}
          {!loading && (
            <>
              {user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-xl w-56 p-2 shadow-lg border border-base-200 mt-2 z-50"
                  >
                    <li className="menu-title px-4 py-2">
                      <span className="text-xs text-base-content/50 uppercase tracking-wider">
                        {user.name}
                      </span>
                      <span className="text-xs text-base-content/40 capitalize">
                        {user.role}
                      </span>
                    </li>
                    <div className="divider my-0"></div>
                    <li>
                      <Link href="/wishlist" className="text-sm">
                        My Wishlist
                      </Link>
                    </li>
                    <li>
                      <Link href="/cart" className="text-sm">
                        My Cart
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="text-sm text-error hover:bg-error/10"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn btn-ghost btn-sm text-sm">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary btn-sm text-sm">
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-base-100 z-[60] lg:hidden animate-rise">
          <ul className="menu p-6 text-lg gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-3 ${
                    isActive(link.href)
                      ? "active bg-primary text-primary-content font-semibold"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!loading && user && (
              <li>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-3 ${
                    isActive("/wishlist")
                      ? "active bg-primary text-primary-content font-semibold"
                      : ""
                  }`}
                >
                  ❤️ Wishlist
                </Link>
              </li>
            )}
            {!loading && user?.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-3 ${
                    isActive("/admin")
                      ? "active bg-primary text-primary-content font-semibold"
                      : ""
                  }`}
                >
                  Admin Dashboard
                </Link>
              </li>
            )}
            {!loading && user?.role === "seller" && (
              <li>
                <Link
                  href="/seller"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-3 ${
                    isActive("/seller")
                      ? "active bg-primary text-primary-content font-semibold"
                      : ""
                  }`}
                >
                  Seller Portal
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
