import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineHome, HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-rise">
      <div className="max-w-xl w-full text-center">
        {/* Subtle background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.03]">
          <h1 className="text-[20rem] font-bold">404</h1>
        </div>

        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-ping opacity-20"></div>
          <HiOutlineMagnifyingGlass className="w-10 h-10 text-primary" />
        </div>

        {/* Text */}
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 font-[var(--font-display)]">
          Error 404 - Page Not Found
        </h1>
        <p className="text-lg text-base-content/50 mb-10 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for has moved or vanished into the void.
          Don&apos;t worry, we can help you find your way back.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="btn btn-primary btn-lg px-8 gap-2 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all w-full sm:w-auto"
          >
            <HiOutlineHome className="w-5 h-5" />
            Back Home
          </Link>
          <Link
            href="/store"
            className="btn btn-outline btn-lg px-8 gap-2 w-full sm:w-auto"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Explore Store
          </Link>
        </div>

        {/* Links */}
        <div className="mt-12 pt-8 border-t border-base-200 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-base-content/40">
          <Link href="/store?category=electronics" className="hover:text-primary transition-colors">Electronics</Link>
          <Link href="/store?category=clothing" className="hover:text-primary transition-colors">Clothing</Link>
          <Link href="/store?category=accessories" className="hover:text-primary transition-colors">Accessories</Link>
        </div>
      </div>
    </div>
  );
}
