"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineBriefcase,
} from "react-icons/hi2";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  // Redirect away if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectUrl || "/");
    }
  }, [user, loading, router, redirectUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone (optional but validate format if provided)
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{7,20}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);
    const result = await register(
      formData.name.trim(),
      formData.email.trim(),
      formData.password,
      formData.phone.trim(),
      formData.role,
      redirectUrl
    );

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
          <h1 className="text-2xl font-medium tracking-tight">Create your account</h1>
          <p className="text-base-content/50 mt-1">Join Storely and start shopping</p>
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

            <form onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="form-control mb-3">
                <label className="label pb-1">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.name ? "input-error" : ""}`}>
                  <HiOutlineUser className="w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="grow"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </label>
                {errors.name && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control mb-3">
                <label className="label pb-1">
                  <span className="label-text font-medium">Email</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.email ? "input-error" : ""}`}>
                  <HiOutlineEnvelope className="w-4 h-4 text-base-content/40" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="grow"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>
                {errors.email && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* Password */}
              <div className="form-control mb-3">
                <label className="label pb-1">
                  <span className="label-text font-medium">Password</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.password ? "input-error" : ""}`}>
                  <HiOutlineLockClosed className="w-4 h-4 text-base-content/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="grow"
                    value={formData.password}
                    onChange={handleChange}
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
                  <label className="label py-1">
                    <span className="label-text-alt text-error">{errors.password}</span>
                  </label>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-control mb-3">
                <label className="label pb-1">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.confirmPassword ? "input-error" : ""}`}>
                  <HiOutlineLockClosed className="w-4 h-4 text-base-content/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="grow"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </label>
                {errors.confirmPassword && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                  </label>
                )}
              </div>

              {/* Phone */}
              <div className="form-control mb-3">
                <label className="label pb-1">
                  <span className="label-text font-medium">
                    Phone <span className="text-base-content/40 font-normal">(optional)</span>
                  </span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.phone ? "input-error" : ""}`}>
                  <HiOutlinePhone className="w-4 h-4 text-base-content/40" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+20 123 456 7890"
                    className="grow"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </label>
                {errors.phone && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">{errors.phone}</span>
                  </label>
                )}
              </div>

              {/* Role */}
              <div className="form-control mb-6">
                <label className="label pb-1">
                  <span className="label-text font-medium">Account Type</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`card border-2 cursor-pointer transition-all hover:shadow-sm ${
                      formData.role === "customer"
                        ? "border-primary bg-primary/5"
                        : "border-base-200"
                    }`}
                  >
                    <div className="card-body p-3 items-center text-center gap-1">
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        className="radio radio-primary radio-sm"
                        checked={formData.role === "customer"}
                        onChange={handleChange}
                      />
                      <p className="font-semibold text-sm">Customer</p>
                      <p className="text-xs text-base-content/50">Buy products</p>
                    </div>
                  </label>
                  <label
                    className={`card border-2 cursor-pointer transition-all hover:shadow-sm ${
                      formData.role === "seller"
                        ? "border-primary bg-primary/5"
                        : "border-base-200"
                    }`}
                  >
                    <div className="card-body p-3 items-center text-center gap-1">
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        className="radio radio-primary radio-sm"
                        checked={formData.role === "seller"}
                        onChange={handleChange}
                      />
                      <p className="font-semibold text-sm">Seller</p>
                      <p className="text-xs text-base-content/50">Sell products</p>
                    </div>
                  </label>
                </div>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider text-xs text-base-content/40 my-6">ALREADY A MEMBER?</div>

            {/* Login link */}
            <p className="text-center text-sm text-base-content/60">
              Already have an account?{" "}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
                className="link link-primary font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
