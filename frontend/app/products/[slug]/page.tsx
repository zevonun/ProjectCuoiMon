

export interface Product {
  _id: string;       // frontend luôn dùng _id
  id?: string;       // backend có thể trả id
  ten_sp: string;
  gia: number;
  gia_km?: number;
  hinh?: string;
  mo_ta?: string;
  brandId?: string;
  loaiId?: string;
}

export interface Loai {
  _id: string;
  id?: string;
  ten_loai: string;
}

// --- CATEGORY ---

export const fetchCategoryById = async (id: string): Promise<Loai | null> => {
  try {
    const res = await fetch(`http://localhost:5000/api/category/id/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data) return null;
    const cat = json.data;
    return { ...cat, _id: cat._id ?? cat.id };
  } catch (err) {
    console.error("Fetch category by ID error:", err);
    return null;
  }
};
export const fetchAllCategories = async (): Promise<Loai[]> => {
  try {
    const res = await fetch("http://localhost:5000/api/category", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json.data)) return [];

    // Thêm kiểu cho cat, sửa id → _id
    return json.data.map((cat: { _id: string; ten_loai: string }) => ({
      ...cat,
      _id: cat._id ?? "", // chắc chắn _id có giá trị
    }));
  } catch (err) {
    console.error("Fetch all categories error:", err);
    return [];
  }
};


// --- PRODUCT ---

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const res = await fetch(`http://localhost:5000/api/product/id/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data) return null;
    const prod = json.data;
    return { ...prod, _id: prod._id ?? prod.id };
  } catch (err) {
    console.error("Fetch product by ID error:", err);
    return null;
  }
};

export const fetchProductsByCategorySlug = async (slug: string): Promise<Product[]> => {
  try {
    const res = await fetch(`http://localhost:5000/api/products?category=${slug}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    let list: Product[] = [];
    if (json?.success && Array.isArray(json.data)) list = json.data;
    else if (Array.isArray(json)) list = json;
    else if (json?.products && Array.isArray(json.products)) list = json.products;

    return list.map(p => ({ ...p, _id: p._id ?? p.id }));
  } catch (err) {
    console.error("Fetch products by category error:", err);
    return [];
  }
};

export const fetchRelatedProducts = async (productId: string, loaiId: string): Promise<Product[]> => {
  try {
    const res = await fetch(`http://localhost:5000/api/products/related?productId=${productId}&loaiId=${loaiId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    let list: Product[] = [];
    if (json?.success && Array.isArray(json.data)) list = json.data;
    else if (Array.isArray(json)) list = json;
    else if (json?.products && Array.isArray(json.products)) list = json.products;

    return list.map(p => ({ ...p, _id: p._id ?? p.id }));
  } catch (err) {
    console.error("Fetch related products error:", err);
    return [];
  }
};
