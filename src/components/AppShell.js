"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import SellerNavbar from "@/components/SellerNavbar";

// Pages that sellers should NOT access (customer-only pages)
const CUSTOMER_ONLY = ["/store", "/cart", "/checkout", "/wishlist", "/product", "/orders"];
// Pages open to everyone (login, register, home)
const PUBLIC_PAGES = ["/login", "/register"];

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isSeller = !loading && user?.role === "seller";
  const isSellerRoute = pathname.startsWith("/seller");

  // Redirect sellers away from customer-only pages
  useEffect(() => {
    if (!loading && isSeller && !isSellerRoute && !PUBLIC_PAGES.includes(pathname)) {
      // Check if the current path matches a customer-only route
      const isCustomerPage = CUSTOMER_ONLY.some((p) => pathname.startsWith(p)) || pathname === "/";
      if (isCustomerPage) {
        router.push("/seller");
      }
    }
  }, [loading, isSeller, isSellerRoute, pathname, router]);

  // Show seller navbar for seller users
  if (isSeller) {
    return (
      <>
        <SellerNavbar />
        <main className="flex-grow">{children}</main>
        <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-auto border-t border-base-300">
          <aside>
            <p className="text-sm text-base-content/60">
              © {new Date().getFullYear()} Storely — Seller Portal
            </p>
          </aside>
        </footer>
      </>
    );
  }

  // Show customer navbar for everyone else
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-auto border-t border-base-300">
        <aside>
          <p className="text-sm text-base-content/60">
            © {new Date().getFullYear()} Storely — Considered goods for everyday life.
          </p>
        </aside>
      </footer>
    </>
  );
}
