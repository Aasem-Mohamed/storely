"use client";

import { useAuth } from "@/context/AuthContext";

export default function GlobalLoader() {
  const { loading } = useAuth();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-base-100">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm text-base-content/50 font-medium tracking-wide animate-pulse">
          Loading Storely...
        </p>
      </div>
    </div>
  );
}
