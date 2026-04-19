"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Storely
        </Link>

        {!loading && (
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-300">
                  Welcome, {user.name} ({user.role})
                </span>
                
                {user.role === "admin" && (
                  <Link href="/admin" className="hover:text-gray-300">Admin Dashboard</Link>
                )}
                {user.role === "seller" && (
                  <Link href="/seller" className="hover:text-gray-300">Seller Portal</Link>
                )}
                
                <button 
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-300">Login</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
