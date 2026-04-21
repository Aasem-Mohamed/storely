"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlinePhoto,
} from "react-icons/hi2";

const CATEGORIES = [
  "electronics",
  "clothing",
  "home & kitchen",
  "sports",
  "food & beverages",
  "accessories",
];

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  images: [""],
};

function validateProduct(data) {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = "Product name is required";
  } else if (data.name.trim().length > 200) {
    errors.name = "Name cannot exceed 200 characters";
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  } else if (data.description.trim().length > 2000) {
    errors.description = "Description cannot exceed 2000 characters";
  }

  if (data.price === "" || data.price === undefined || data.price === null) {
    errors.price = "Price is required";
  } else if (isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = "Price must be a non-negative number";
  }

  if (!data.category) {
    errors.category = "Category is required";
  } else if (!CATEGORIES.includes(data.category.toLowerCase())) {
    errors.category = "Please select a valid category";
  }

  if (data.stock === "" || data.stock === undefined || data.stock === null) {
    errors.stock = "Stock is required";
  } else if (isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) {
    errors.stock = "Stock must be a non-negative integer";
  }

  // Validate image URLs (only non-empty ones)
  const nonEmptyImages = (data.images || []).filter((url) => url.trim());
  for (let i = 0; i < nonEmptyImages.length; i++) {
    try {
      new URL(nonEmptyImages[i]);
    } catch {
      errors.images = "Please enter valid image URLs";
      break;
    }
  }

  return errors;
}

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, outOfStock: 0 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_PRODUCT });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formServerError, setFormServerError] = useState("");

  // Delete state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Success toast
  const [toast, setToast] = useState("");

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
    }
  }, [user, authLoading, router]);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "100",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        const active = data.products.filter((p) => p.isActive).length;
        const outOfStock = data.products.filter((p) => p.stock === 0).length;
        setStats({
          total: data.pagination?.totalProducts || data.products.length,
          active,
          outOfStock,
        });
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  // Show toast message
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Modal Handlers ──

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ ...EMPTY_PRODUCT });
    setFormErrors({});
    setFormServerError("");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      stock: product.stock?.toString() || "",
      images: product.images?.length > 0 ? [...product.images] : [""],
    });
    setFormErrors({});
    setFormServerError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormData({ ...EMPTY_PRODUCT });
    setFormErrors({});
    setFormServerError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
    if (formErrors.images) {
      setFormErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    if (formData.images.length <= 1) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormServerError("");

    const errors = validateProduct(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
      let res;
      if (modalMode === "add") {
        res = await fetch("/api/products", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (data.success) {
        closeModal();
        fetchProducts();
        showToast(modalMode === "add" ? "Product created successfully!" : "Product updated successfully!");
      } else {
        setFormServerError(data.message || "Something went wrong");
      }
    } catch (err) {
      setFormServerError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete Handlers ──

  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        setDeleteModal(false);
        setDeletingProduct(null);
        fetchProducts();
        showToast("Product deleted successfully!");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Auth loading state
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <div className="animate-rise">
      {/* Header */}
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">Admin Dashboard</h1>
              <p className="text-base-content/50 mt-1">Manage your products, {user.name}</p>
            </div>
            <button onClick={openAddModal} className="btn btn-primary gap-2">
              <HiOutlinePlus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <HiOutlineArchiveBox className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Total Products</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <HiOutlineCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Active</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="join w-full max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered join-item w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary join-item" onClick={fetchProducts}>
              <HiOutlineMagnifyingGlass className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-base-content/50 mb-6">Add your first product to get started</p>
            <button onClick={openAddModal} className="btn btn-primary gap-2">
              <HiOutlinePlus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="font-semibold text-xs uppercase tracking-wider">Product</th>
                    <th className="font-semibold text-xs uppercase tracking-wider">Category</th>
                    <th className="font-semibold text-xs uppercase tracking-wider">Price</th>
                    <th className="font-semibold text-xs uppercase tracking-wider">Stock</th>
                    <th className="font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const img = product.images?.[0] || `https://placehold.co/40x40/f5f5f4/a8a29e?text=${product.name?.charAt(0)}`;
                    return (
                      <tr key={product._id} className="hover:bg-base-200/30 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-lg">
                                <img src={img} alt={product.name} />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm line-clamp-1 max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-base-content/40 line-clamp-1 max-w-[200px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-sm badge-ghost capitalize">{product.category}</span>
                        </td>
                        <td className="font-medium">EGP {product.price?.toLocaleString()}</td>
                        <td>
                          <span className={`font-medium ${product.stock === 0 ? "text-error" : product.stock <= 5 ? "text-warning" : ""}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          {product.isActive ? (
                            <span className="badge badge-sm badge-success gap-1">Active</span>
                          ) : (
                            <span className="badge badge-sm badge-error gap-1">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditModal(product)}
                              className="btn btn-ghost btn-xs btn-square tooltip"
                              data-tip="Edit"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="btn btn-ghost btn-xs btn-square text-error tooltip"
                              data-tip="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none h-px"></div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="modal modal-open items-start justify-center overflow-y-auto z-[100] pt-10 pb-10">
          <div className="modal-box w-11/12 max-w-2xl my-auto relative">
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
              <HiOutlineXMark className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-6">
              {modalMode === "add" ? "Add New Product" : "Edit Product"}
            </h3>

            {formServerError && (
              <div className="alert alert-error text-sm mb-4">
                <HiOutlineExclamationTriangle className="w-5 h-5" />
                <span>{formServerError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Product Name *</span>
                    <span className="label-text-alt text-base-content/40">{formData.name.length}/200</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    className={`input input-bordered w-full ${formErrors.name ? "input-error" : ""}`}
                    maxLength={200}
                  />
                  {formErrors.name && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error">{formErrors.name}</span>
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Description *</span>
                    <span className="label-text-alt text-base-content/40">{formData.description.length}/2000</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe your product..."
                    className={`textarea textarea-bordered w-full min-h-[100px] ${formErrors.description ? "textarea-error" : ""}`}
                    maxLength={2000}
                  />
                  {formErrors.description && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error">{formErrors.description}</span>
                    </label>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">Price (EGP) *</span>
                    </label>
                    <label className={`input input-bordered flex items-center gap-2 ${formErrors.price ? "input-error" : ""}`}>
                      <HiOutlineCurrencyDollar className="w-4 h-4 text-base-content/40" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        className="grow"
                        min="0"
                        step="0.01"
                      />
                    </label>
                    {formErrors.price && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error">{formErrors.price}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">Stock *</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="0"
                      className={`input input-bordered w-full ${formErrors.stock ? "input-error" : ""}`}
                      min="0"
                      step="1"
                    />
                    {formErrors.stock && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error">{formErrors.stock}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Category *</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={`select select-bordered w-full ${formErrors.category ? "select-error" : ""}`}
                  >
                    <option value="" disabled>Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error">{formErrors.category}</span>
                    </label>
                  )}
                </div>

                {/* Images */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">
                      Image URLs <span className="text-base-content/40 font-normal">(optional)</span>
                    </span>
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <label className={`input input-bordered flex items-center gap-2 flex-1 ${formErrors.images ? "input-error" : ""}`}>
                          <HiOutlinePhoto className="w-4 h-4 text-base-content/40 shrink-0" />
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="grow"
                          />
                        </label>
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="btn btn-ghost btn-sm btn-square text-error"
                          >
                            <HiOutlineXMark className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formErrors.images && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error">{formErrors.images}</span>
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="btn btn-ghost btn-xs mt-2 gap-1 self-start"
                  >
                    <HiOutlinePlus className="w-3 h-3" /> Add another image
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-action">
                <button type="button" onClick={closeModal} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn btn-primary gap-2">
                  {formLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {modalMode === "add" ? "Creating..." : "Saving..."}
                    </>
                  ) : modalMode === "add" ? (
                    <>
                      <HiOutlinePlus className="w-4 h-4" />
                      Create Product
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal && deletingProduct && (
        <div className="modal modal-open items-start justify-center overflow-y-auto z-[100] pt-10 pb-10">
          <div className="modal-box max-w-sm my-auto relative">
            <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
            <p className="text-base-content/60 text-sm mb-1">
              Are you sure you want to delete this product?
            </p>
            <p className="font-semibold text-sm mb-4">&quot;{deletingProduct.name}&quot;</p>
            <p className="text-xs text-error/80">This action cannot be undone.</p>

            <div className="modal-action">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeletingProduct(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="btn btn-error btn-sm gap-1"
              >
                {deleteLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <HiOutlineTrash className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setDeleteModal(false);
              setDeletingProduct(null);
            }}
          ></div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className="alert alert-success shadow-lg animate-slide-up">
            <HiOutlineCheck className="w-5 h-5" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
