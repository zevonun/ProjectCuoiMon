import { fetchProducts } from "../../lib/api";
import ProductsClientPage from "./ProductsClientPage";
import { FilterState } from "./FilterSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SearchParams {
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  // ── Đọc filter từ URL params ──
  const currentFilters: FilterState = {
    minPrice: sp.minPrice ? Number(sp.minPrice) : "",
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : "",
    sort: (sp.sort as FilterState["sort"]) || "default",
  };

  // ── Xây URL gọi backend kèm filter params ──
  const query = new URLSearchParams();
  query.set("category", slug); // slug = categoryId hoặc tên danh mục

  if (currentFilters.minPrice !== "") query.set("minPrice", String(currentFilters.minPrice));
  if (currentFilters.maxPrice !== "") query.set("maxPrice", String(currentFilters.maxPrice));
  if (currentFilters.sort !== "default") query.set("sort", currentFilters.sort);

  // fetchProducts trả về Product[] — cần total nên gọi fetch trực tiếp
  const res = await fetch(`${API_URL}/api/product?${query.toString()}`, {
    cache: "no-store",
  });

  let products = [];
  let total = 0;

  if (res.ok) {
    const json = await res.json();
    products = (json.data || []).map((p: Record<string, unknown>) => ({
      _id:        String(p._id || ""),
      ten_sp:     String(p.ten_sp || p.name || ""),
      gia:        Number(p.gia || p.price || 0),
      gia_km:     p.gia_km != null ? Number(p.gia_km) : null,
      hinh:       String(p.hinh || p.image || "/img/no-image.jpg"),
      categoryId: p.categoryId ? String(p.categoryId) : undefined,
    }));
    total = json.total ?? products.length;
  }

  return (
    <ProductsClientPage
      products={products}
      total={total}
      slug={slug}
      currentFilters={currentFilters}
    />
  );
}
