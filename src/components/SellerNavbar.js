"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  HiOutlineChartBarSquare,
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiXMark,
} from "react-icons/hi2";

export default function SellerNavbar() {
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/seller", label: "Overview", icon: HiOutlineChartBarSquare, exact: true },
    { href: "/seller/products", label: "My Products", icon: HiOutlineArchiveBox },
    { href: "/seller/orders", label: "Orders", icon: HiOutlineClipboardDocumentList },
  ];

  const isActive = (href, exact) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 px-4 lg:px-8">
        {/* Left: Logo + Hamburger */}
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
            href="/seller"
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Storely<span className="text-primary text-sm font-normal ml-1.5">Seller</span>
          </Link>
        </div>

        {/* Center: Nav links (Desktop) */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg transition-colors gap-2 ${
                    isActive(link.href, link.exact)
                      ? "active bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: User */}
        <div className="navbar-end gap-1">
          {!loading && user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-xl w-56 p-2 shadow-lg border border-base-200 mt-2 z-50">
                <li className="menu-title px-4 py-2">
                  <span className="text-xs text-base-content/50 uppercase tracking-wider">{user.name}</span>
                  <span className="text-xs text-base-content/40 capitalize">{user.role}</span>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <button onClick={logout} className="text-sm text-error hover:bg-error/10 gap-2">
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-base-100 z-[60] lg:hidden animate-rise">
          <ul className="menu p-6 text-lg gap-2">
            <li className="menu-title px-4 mb-2">
              <span className="text-xs text-base-content/40 uppercase tracking-widest font-bold">Seller Menu</span>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-3 gap-3 ${
                    isActive(link.href, link.exact)
                      ? "active bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            ))}
            <div className="divider opacity-50"></div>
            <li>
              <button 
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }} 
                className="rounded-lg py-3 text-error hover:bg-error/10 gap-3"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
