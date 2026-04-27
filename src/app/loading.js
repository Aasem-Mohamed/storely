"use client";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Brand logo/name animation */}
      <div className="mb-8 relative">
        <h1 className="text-4xl font-bold tracking-tight animate-pulse" style={{ fontFamily: "var(--font-display)" }}>
          Storely
        </h1>
        <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full overflow-hidden">
          <div className="w-full h-full bg-base-100/50 animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>

      {/* Modern spinner */}
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <p className="text-sm font-medium text-base-content/40 tracking-widest uppercase">
          Curating your experience...
        </p>
      </div>

      {/* Subtle skeleton-like background */}
      <div className="fixed inset-0 -z-10 opacity-[0.02] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
