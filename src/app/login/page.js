"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  // Redirect away if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectUrl || "/");
    }
  }, [user, loading, router, redirectUrl]);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);
    const result = await login(email, password, redirectUrl);

    if (!result.success) {
      setServerError(result.message);
    }
    setIsLoading(false);
  };

  // Don't render the form if already logged in
  if (!loading && user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-rise">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight inline-block mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Storely
          </Link>
          <h1 className="text-2xl font-medium tracking-tight">Welcome back</h1>
          <p className="text-base-content/50 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body p-6 sm:p-8">
            {/* Server error */}
            {serverError && (
              <div className="alert alert-error text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            {/* Redirect notice */}
            {redirectUrl && (
              <div className="alert alert-info text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Please login to continue</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.email ? "input-error" : ""}`}>
                  <HiOutlineEnvelope className="w-4 h-4 text-base-content/40" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="grow"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                </label>
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* Password */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.password ? "input-error" : ""}`}>
                  <HiOutlineLockClosed className="w-4 h-4 text-base-content/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="grow"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="w-4 h-4 text-base-content/40" />
                    ) : (
                      <HiOutlineEye className="w-4 h-4 text-base-content/40" />
                    )}
                  </button>
                </label>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.password}</span>
                  </label>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full text-base"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider text-xs text-base-content/40 my-6">NEW HERE?</div>

            {/* Register link */}
            <p className="text-center text-sm text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link
                href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                className="link link-primary font-semibold"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
