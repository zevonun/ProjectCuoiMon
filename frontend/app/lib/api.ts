// lib/api.ts
export interface Product {
  _id: string;
  ten_sp: string;
  gia: number;
  gia_km?: number | null;
  hinh: string;
  mo_ta?: string;   
  categoryId?: string;
  brandId?: string | null;
  sale?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

// Helper chuẩn hóa dữ liệu – KHÔNG dùng any
const normalizeProduct = (raw: unknown): Product => {
  const p = raw as Record<string, unknown>;

  const categoryId = (p.categoryId ?? p.id_loai ?? "") as string;

  return {
    _id: (p._id ?? p.id ?? "").toString(),
    ten_sp: (p.ten_sp as string) ?? (p.name as string) ?? "Chưa có tên",
    gia: Number(p.gia ?? p.price ?? 0),
    gia_km: p.gia_km != null ? Number(p.gia_km) : null,
    hinh: (p.hinh as string) ?? (p.image as string) ?? "/img/no-image.jpg",
    categoryId: categoryId || undefined,
    brandId: (p.brandId as string) ?? null,
    sale: p.sale != null ? Number(p.sale) : 0,
  };
};

// Các hàm fetch
export const fetchProducts = async (apiUrl: string): Promise<Product[]> => {
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const list = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list.map(normalizeProduct);
  } catch {
    return [];
  }
};
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    // THỬ TẤT CẢ CÁC KHẢ NĂNG MÀ DỰ ÁN VN HAY DÙNG
    const urls = [
      `http://localhost:5000/api/product/${id}`,
      `http://localhost:5000/api/product/${id}`,
      `http://localhost:5000/api/product/id/${id}`,
      `http://localhost:5000/api/product/id/${id}`,
    ];

    for (const url of urls) {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          console.log("TÌM THẤY ở URL:", url); // để biết lần sau dùng cái nào
          return normalizeProduct(json.data);
        }
      }
    }

    console.warn("Không tìm thấy sản phẩm ở bất kỳ URL nào:", id);
    return null;
  } catch (err) {
    console.error("Lỗi fetch sản phẩm:", err);
    return null;
  }
};

export const fetchCategoryById = async (id: string): Promise<Category | undefined> => {
  try {
    const res = await fetch(`http://localhost:5000/api/category/id/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;

    const json = await res.json();
    const c = json?.data ?? json;
    if (!c?._id) return undefined;

    return {
      _id: c._id.toString(),
      name: (c.name ?? c.ten_loai ?? "Không tên") as string,
    };
  } catch {
    return undefined;
  }
};

export const fetchRelatedProducts = async (
  productId: string,
  categoryId: string
): Promise<Product[]> => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/product/related?productId=${productId}&categoryId=${categoryId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];

    const json = await res.json();
    const list = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list.map(normalizeProduct);
  } catch {
    return [];
  }
};