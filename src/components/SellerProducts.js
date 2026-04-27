"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function SellerProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100", sortBy: "createdAt", sortOrder: "desc" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/seller/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Fetch seller products error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, token]);

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, fetchProducts]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openDeleteModal = (product) => { setDeletingProduct(product); setDeleteModal(true); };
  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModal(false);
        setDeletingProduct(null);
        fetchProducts();
        showToast("Product deleted!");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="join flex-1 max-w-md">
          <input type="text" placeholder="Search your products..." className="input input-bordered join-item w-full"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary join-item" onClick={fetchProducts}>
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </button>
        </div>
        <Link href="/seller/products/new" className="btn btn-primary gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg"></span></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
            <HiOutlineArchiveBox className="w-10 h-10 text-base-content/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products yet</h3>
          <p className="text-base-content/50 mb-6">Add your first product to start selling</p>
          <Link href="/seller/products/new" className="btn btn-primary gap-2">
            <HiOutlinePlus className="w-4 h-4" /> Add Product
          </Link>
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
                          <div className="avatar"><div className="w-10 h-10 rounded-lg"><img src={img} alt={product.name} /></div></div>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1 max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-base-content/40 line-clamp-1 max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-sm badge-ghost capitalize">{product.category}</span></td>
                      <td className="font-medium">EGP {product.price?.toLocaleString()}</td>
                      <td><span className={`font-medium ${product.stock === 0 ? "text-error" : product.stock <= 5 ? "text-warning" : ""}`}>{product.stock}</span></td>
                      <td>
                        {product.stock === 0 ? (
                          <span className="badge badge-sm badge-warning gap-1">Out of Stock</span>
                        ) : product.isActive ? (
                          <span className="badge badge-sm badge-success gap-1">Active</span>
                        ) : (
                          <span className="badge badge-sm badge-error gap-1">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Link href={`/seller/products/${product._id}/edit`} className="btn btn-ghost btn-xs btn-square tooltip" data-tip="Edit">
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openDeleteModal(product)} className="btn btn-ghost btn-xs btn-square text-error tooltip" data-tip="Delete">
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

      {/* Delete Confirmation Modal (kept as modal since it's a quick action) */}
      {deleteModal && deletingProduct && (
        <div className="modal modal-open items-start justify-center overflow-y-auto z-[100] pt-10 pb-10">
          <div className="modal-box max-w-sm my-auto relative">
            <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
            <p className="text-base-content/60 text-sm mb-1">Are you sure you want to delete this product?</p>
            <p className="font-semibold text-sm mb-4">&quot;{deletingProduct.name}&quot;</p>
            <p className="text-xs text-error/80">This action cannot be undone.</p>
            <div className="modal-action">
              <button onClick={() => { setDeleteModal(false); setDeletingProduct(null); }} className="btn btn-ghost btn-sm">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteLoading} className="btn btn-error btn-sm gap-1">
                {deleteLoading ? (<><span className="loading loading-spinner loading-xs"></span>Deleting...</>) : (<><HiOutlineTrash className="w-4 h-4" />Delete</>)}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setDeleteModal(false); setDeletingProduct(null); }}></div>
        </div>
      )}

      {/* Toast */}
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
