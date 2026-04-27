"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineCheck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlinePhoto,
  HiOutlineArrowLeft,
  HiOutlinePlus,
} from "react-icons/hi2";

const CATEGORIES = [
  "electronics", "clothing", "home & kitchen",
  "sports", "food & beverages", "accessories",
];

function validateProduct(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = "Product name is required";
  else if (data.name.trim().length > 200) errors.name = "Name cannot exceed 200 characters";
  if (!data.description?.trim()) errors.description = "Description is required";
  else if (data.description.trim().length > 2000) errors.description = "Description cannot exceed 2000 characters";
  if (data.price === "" || data.price === undefined || data.price === null) errors.price = "Price is required";
  else if (isNaN(Number(data.price)) || Number(data.price) < 0) errors.price = "Price must be a non-negative number";
  if (!data.category) errors.category = "Category is required";
  else if (!CATEGORIES.includes(data.category.toLowerCase())) errors.category = "Please select a valid category";
  if (data.stock === "" || data.stock === undefined || data.stock === null) errors.stock = "Stock is required";
  else if (isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) errors.stock = "Stock must be a non-negative integer";
  const nonEmptyImages = (data.images || []).filter((url) => url.trim());
  for (let i = 0; i < nonEmptyImages.length; i++) {
    try { new URL(nonEmptyImages[i]); } catch { errors.images = "Please enter valid image URLs"; break; }
  }
  return errors;
}

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: "", stock: "", images: [""],
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "seller") router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch existing product data
  useEffect(() => {
    if (user?.role === "seller" && token && id) {
      fetchProduct();
    }
  }, [user, token, id]);

  const fetchProduct = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.product) {
        const p = data.product;
        setFormData({
          name: p.name || "",
          description: p.description || "",
          price: p.price?.toString() || "",
          category: p.category || "",
          stock: p.stock?.toString() || "",
          images: p.images?.length > 0 ? [...p.images] : [""],
        });
      } else {
        setServerError("Product not found");
      }
    } catch {
      setServerError("Failed to load product");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
    if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: "" }));
  };

  const addImageField = () => setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));

  const removeImageField = (index) => {
    if (formData.images.length <= 1) return;
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errors = validateProduct(formData);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setFormLoading(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.toLowerCase(),
      stock: Number(formData.stock),
      images: formData.images.filter((url) => url.trim()),
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/seller/products");
      } else {
        setServerError(data.message || "Something went wrong");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const previewImage = formData.images.find((url) => url.trim());

  if (authLoading || !user || user.role !== "seller") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <Link href="/seller/products" className="btn btn-ghost btn-sm gap-1 mb-4 -ml-2">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">Edit Product</h1>
          <p className="text-base-content/50 mt-1">Update the details for your product</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6 lg:p-8">
                {serverError && (
                  <div className="alert alert-error text-sm mb-4">
                    <HiOutlineExclamationTriangle className="w-5 h-5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text font-medium">Product Name *</span>
                        <span className="label-text-alt text-base-content/40">{formData.name.length}/200</span>
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="e.g. Wireless Bluetooth Headphones"
                        className={`input input-bordered w-full ${formErrors.name ? "input-error" : ""}`} maxLength={200} />
                      {formErrors.name && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.name}</span></label>}
                    </div>

                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text font-medium">Description *</span>
                        <span className="label-text-alt text-base-content/40">{formData.description.length}/2000</span>
                      </label>
                      <textarea name="description" value={formData.description} onChange={handleChange}
                        placeholder="Describe your product in detail..."
                        className={`textarea textarea-bordered w-full min-h-[150px] ${formErrors.description ? "textarea-error" : ""}`} maxLength={2000} />
                      {formErrors.description && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.description}</span></label>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label pb-1"><span className="label-text font-medium">Price (EGP) *</span></label>
                        <label className={`input input-bordered flex items-center gap-2 ${formErrors.price ? "input-error" : ""}`}>
                          <HiOutlineCurrencyDollar className="w-4 h-4 text-base-content/40" />
                          <input type="number" name="price" value={formData.price} onChange={handleChange}
                            placeholder="0.00" className="grow" min="0" step="0.01" />
                        </label>
                        {formErrors.price && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.price}</span></label>}
                      </div>
                      <div className="form-control">
                        <label className="label pb-1"><span className="label-text font-medium">Stock Quantity *</span></label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                          placeholder="0" className={`input input-bordered w-full ${formErrors.stock ? "input-error" : ""}`} min="0" step="1" />
                        {formErrors.stock && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.stock}</span></label>}
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label pb-1"><span className="label-text font-medium">Category *</span></label>
                      <select name="category" value={formData.category} onChange={handleChange}
                        className={`select select-bordered w-full ${formErrors.category ? "select-error" : ""}`}>
                        <option value="" disabled>Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                      {formErrors.category && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.category}</span></label>}
                    </div>

                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text font-medium">Image URLs <span className="text-base-content/40 font-normal">(optional)</span></span>
                      </label>
                      <div className="space-y-3">
                        {formData.images.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <label className={`input input-bordered flex items-center gap-2 flex-1 ${formErrors.images ? "input-error" : ""}`}>
                              <HiOutlinePhoto className="w-4 h-4 text-base-content/40 shrink-0" />
                              <input type="url" value={url} onChange={(e) => handleImageChange(index, e.target.value)}
                                placeholder="https://example.com/image.jpg" className="grow" />
                            </label>
                            {formData.images.length > 1 && (
                              <button type="button" onClick={() => removeImageField(index)} className="btn btn-ghost btn-sm btn-square text-error">
                                <HiOutlineXMark className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {formErrors.images && <label className="label py-1"><span className="label-text-alt text-error">{formErrors.images}</span></label>}
                      <button type="button" onClick={addImageField} className="btn btn-ghost btn-xs mt-2 gap-1 self-start">
                        <HiOutlinePlus className="w-3 h-3" /> Add another image
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-base-200">
                    <Link href="/seller/products" className="btn btn-ghost">Cancel</Link>
                    <button type="submit" disabled={formLoading} className="btn btn-primary gap-2">
                      {formLoading ? (
                        <><span className="loading loading-spinner loading-sm"></span>Saving...</>
                      ) : (
                        <><HiOutlineCheck className="w-4 h-4" />Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm border border-base-200 sticky top-20">
              <div className="card-body p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/50 mb-4">Preview</h3>
                <div className="rounded-xl overflow-hidden bg-base-200/50 aspect-square mb-4">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/20">
                      <HiOutlinePhoto className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <p className="font-semibold line-clamp-2">{formData.name || "Product Name"}</p>
                <p className="text-sm text-base-content/50 line-clamp-2 mt-1">{formData.description || "Product description"}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">
                    {formData.price ? `EGP ${Number(formData.price).toLocaleString()}` : "EGP 0"}
                  </span>
                  {formData.category && <span className="badge badge-sm badge-ghost capitalize">{formData.category}</span>}
                </div>
                {formData.stock && <p className="text-xs text-base-content/40 mt-2">{formData.stock} in stock</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
