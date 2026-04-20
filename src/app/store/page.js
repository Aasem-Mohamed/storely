"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineXMark, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const CATEGORIES = [
  { name: "All", slug: "" },
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Home & Kitchen", slug: "home & kitchen" },
  { name: "Sports", slug: "sports" },
  { name: "Food & Beverages", slug: "food & beverages" },
  { name: "Accessories", slug: "accessories" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ? `${searchParams.get("sortBy")}-${searchParams.get("sortOrder") || "desc"}` : "createdAt-desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [sortField, sortOrder] = sortBy.split("-");
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", "12");
    params.set("sortBy", sortField);
    params.set("sortOrder", sortOrder);
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) { setProducts(data.products); setPagination(data.pagination); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, category, sortBy, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const [sf, so] = sortBy.split("-");
    if (sf !== "createdAt" || so !== "desc") { params.set("sortBy", sf); params.set("sortOrder", so); }
    if (page > 1) params.set("page", page);
    const qs = params.toString();
    router.replace(`/store${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, category, sortBy, page, router]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); };
  const handleCategoryChange = (slug) => { setCategory(slug); setPage(1); };
  const handleClearFilters = () => { setSearch(""); setCategory(""); setSortBy("createdAt-desc"); setPage(1); };
  const hasActiveFilters = search || category;

  return (
    <div className="animate-rise">
      <section className="bg-base-200/50 border-b border-base-200">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-3xl lg:text-5xl font-medium tracking-tight mb-2">Store</h1>
          <p className="text-base-content/50 text-lg">Browse our complete collection</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="join w-full">
              <input type="text" placeholder="Search products..." className="input input-bordered join-item w-full focus:outline-none" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              <button type="submit" className="btn btn-primary join-item px-4"><HiOutlineMagnifyingGlass className="w-5 h-5" /></button>
            </div>
          </form>
          <select className="select select-bordered w-full md:w-52" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <button className="btn btn-outline gap-2 md:hidden" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
            <HiOutlineFunnel className="w-4 h-4" />Filters
          </button>
        </div>
        <div className="flex gap-8">
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Categories</h3>
                {hasActiveFilters && <button onClick={handleClearFilters} className="btn btn-ghost btn-xs text-error">Clear</button>}
              </div>
              <ul className="menu menu-sm bg-base-100 rounded-xl border border-base-200 p-2 gap-0.5">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}><button onClick={() => handleCategoryChange(cat.slug)} className={`rounded-lg text-sm ${category === cat.slug ? "active bg-primary text-primary-content font-medium" : ""}`}>{cat.name}</button></li>
                ))}
              </ul>
            </div>
          </aside>
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-base-100 p-6 shadow-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setMobileFiltersOpen(false)}><HiOutlineXMark className="w-5 h-5" /></button>
                </div>
                <ul className="menu menu-sm p-0 gap-1">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug}><button onClick={() => { handleCategoryChange(cat.slug); setMobileFiltersOpen(false); }} className={`rounded-lg ${category === cat.slug ? "active bg-primary text-primary-content" : ""}`}>{cat.name}</button></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="flex-1">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && <span className="badge badge-lg badge-outline gap-1">Search: &quot;{search}&quot;<button onClick={() => setSearch("")}><HiOutlineXMark className="w-3 h-3" /></button></span>}
                {category && <span className="badge badge-lg badge-outline gap-1 capitalize">{category}<button onClick={() => setCategory("")}><HiOutlineXMark className="w-3 h-3" /></button></span>}
              </div>
            )}
            {!loading && <p className="text-sm text-base-content/50 mb-4">{pagination.totalProducts || 0} product{pagination.totalProducts !== 1 ? "s" : ""} found</p>}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (<div key={i} className="card bg-base-100 shadow-sm border border-base-200"><div className="skeleton aspect-square w-full rounded-b-none"></div><div className="card-body p-4 gap-3"><div className="skeleton h-3 w-20"></div><div className="skeleton h-4 w-full"></div><div className="skeleton h-3 w-3/4"></div></div></div>))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (<ProductCard key={product._id} product={product} />))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <div className="join">
                      <button className="join-item btn btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}><HiOutlineChevronLeft className="w-4 h-4" /></button>
                      {[...Array(pagination.totalPages)].map((_, i) => (<button key={i + 1} className={`join-item btn btn-sm ${page === i + 1 ? "btn-primary" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>))}
                      <button className="join-item btn btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}><HiOutlineChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-base-content/50 mb-6">Try adjusting your search or filters</p>
                <button onClick={handleClearFilters} className="btn btn-primary btn-sm">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (<Suspense fallback={<div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>}><StoreContent /></Suspense>);
}
