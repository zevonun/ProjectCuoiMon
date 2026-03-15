// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

// Helper resolve ảnh: tự thêm API_URL nếu là đường dẫn tương đối
const resolveImage = (raw: unknown): string => {
  const hinh = (raw as string) || '';
  if (!hinh) return '/img/no-image.jpg';
  if (hinh.startsWith('http')) return hinh;
  return `${API_URL}${hinh.startsWith('/') ? '' : '/'}${hinh}`;
};

// Helper chuẩn hóa dữ liệu
const normalizeProduct = (raw: unknown): Product => {
  const p = raw as Record<string, unknown>;
  const categoryId = (p.categoryId ?? p.id_loai ?? '') as string;

  return {
    _id: (p._id ?? p.id ?? '').toString(),
    ten_sp: ((p.ten_sp ?? p.name ?? 'Chưa có tên') as string),
    gia: Number(p.gia ?? p.price ?? 0),
    gia_km: p.gia_km != null ? Number(p.gia_km) : null,
    hinh: resolveImage(p.hinh ?? p.image),
    categoryId: categoryId || undefined,
    brandId: (p.brandId as string) ?? null,
    sale: p.sale != null ? Number(p.sale) : 0,
  };
};

// ── Fetch danh sách sản phẩm ──
export const fetchProducts = async (apiUrl: string): Promise<Product[]> => {
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return [];

    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data
      : Array.isArray(json) ? json
        : [];

    return list.map(normalizeProduct);
  } catch {
    return [];
  }
};

// ── Fetch sản phẩm theo ID ──
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    // ✅ Chỉ 1 URL đúng theo backend route: GET /api/product/:id
    const res = await fetch(`${API_URL}/api/product/${id}`, { cache: 'no-store' });

    if (!res.ok) return null;

    const json = await res.json();
    if (json.success && json.data) {
      return normalizeProduct(json.data);
    }

    return null;
  } catch (err) {
    console.error('Lỗi fetch sản phẩm:', err);
    return null;
  }
};

// ── Fetch category theo ID ──
export const fetchCategoryById = async (id: string): Promise<Category | undefined> => {
  try {
    // ✅ Đúng route backend: GET /api/categories/:id
    const res = await fetch(`${API_URL}/api/categories/${id}`, { cache: 'no-store' });
    if (!res.ok) return undefined;

    const json = await res.json();
    const c = json?.data ?? json;
    if (!c?._id) return undefined;

    return {
      _id: c._id.toString(),
      name: (c.name ?? c.ten_loai ?? 'Không tên') as string,
    };
  } catch {
    return undefined;
  }
};

// ── Fetch sản phẩm liên quan (cùng category, loại trừ sản phẩm hiện tại) ──
export const fetchRelatedProducts = async (
  productId: string,
  categoryId: string
): Promise<Product[]> => {
  try {
    // ✅ Đúng route backend: GET /api/product/category/:categoryId
    const res = await fetch(
      `${API_URL}/api/product/category/${categoryId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];

    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data
      : Array.isArray(json) ? json
        : [];

    // Loại trừ sản phẩm đang xem
    return list
      .map(normalizeProduct)
      .filter((p: Product) => p._id !== productId)
      .slice(0, 8); // giới hạn 8 sản phẩm liên quan
  } catch {
    return [];
  }
};