"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineBars3,
  HiXMark,
} from "react-icons/hi2";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/store", label: "Store" },
  ];

  return (
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
                className="rounded-lg hover:bg-base-200 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {!loading && user?.role === "admin" && (
            <li>
              <Link href="/admin" className="rounded-lg hover:bg-base-200 transition-colors">
                Admin
              </Link>
            </li>
          )}
          {!loading && user?.role === "seller" && (
            <li>
              <Link href="/seller" className="rounded-lg hover:bg-base-200 transition-colors">
                Seller Portal
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* ── Right: Cart + User ── */}
      <div className="navbar-end gap-2">
        {/* Cart icon with badge */}
        <Link href="/cart" className="btn btn-ghost btn-circle relative">
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

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-base-100 z-40 lg:hidden animate-rise">
          <ul className="menu p-6 text-lg gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg py-3"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!loading && user?.role === "admin" && (
              <li>
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg py-3">
                  Admin Dashboard
                </Link>
              </li>
            )}
            {!loading && user?.role === "seller" && (
              <li>
                <Link href="/seller" onClick={() => setMobileOpen(false)} className="rounded-lg py-3">
                  Seller Portal
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
