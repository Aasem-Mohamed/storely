"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HiOutlineArrowPath, HiOutlineHome, HiOutlineExclamationCircle } from "react-icons/hi2";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-rise">
      <div className="max-w-xl w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-error/5 flex items-center justify-center mx-auto mb-8 relative">
          <HiOutlineExclamationCircle className="w-10 h-10 text-error" />
        </div>

        {/* Text */}
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 font-[var(--font-display)]">
          Something went wrong
        </h1>
        <p className="text-lg text-base-content/50 mb-10 max-w-md mx-auto leading-relaxed">
          We encountered an unexpected error. Our team has been notified and we&apos;re working to fix it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => reset()}
            className="btn btn-primary btn-lg px-8 gap-2 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all w-full sm:w-auto"
          >
            <HiOutlineArrowPath className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn btn-outline btn-lg px-8 gap-2 w-full sm:w-auto"
          >
            <HiOutlineHome className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Tech details (optional/subtle) */}
        <div className="mt-12 p-4 bg-base-200/50 rounded-xl text-left border border-base-200 overflow-hidden">
          <p className="text-xs font-mono text-base-content/40 break-all line-clamp-2">
            Error: {error.message || "Unknown error"}
          </p>
        </div>
      </div>
    </div>
  );
}
