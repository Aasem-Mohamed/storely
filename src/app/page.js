"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Basic fetch just to verify connection to products API
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Storely!</h1>
      {!loading && !user && (
        <p className="mb-4">
          Please <Link href="/login" className="text-blue-600 underline">login</Link> or <Link href="/register" className="text-blue-600 underline">register</Link> to access your account.
        </p>
      )}
      {!loading && user && (
        <p className="mb-4 text-green-700 font-semibold">
          You are successfully logged in as a {user.role}.
        </p>
      )}

      <h2 className="text-2xl font-semibold mt-8 mb-4">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded hover:shadow-md transition">
            <div className="bg-gray-200 h-32 w-full mb-2 flex items-center justify-center text-gray-500 rounded">
              [Image]
            </div>
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        ))}
        {products.length === 0 && <p>No products found.</p>}
      </div>
    </div>
  );
}
