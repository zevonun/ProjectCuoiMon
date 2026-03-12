

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
    const res = await fetch("http://localhost:5000/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json.data)) return [];

    // Thêm kiểu cho cat, sửa id → _id
    return json.data.map((cat: { _id: string; name: string }) => ({
      _id: cat._id ?? "", // chắc chắn _id có giá trị
      ten_loai: cat.name,
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

// fetch products either by slug (name) or by categoryId
export const fetchProductsByCategorySlug = async (slugOrId: string): Promise<Product[]> => {
  try {
    let url: string = '';
    // if argument looks like a Mongo id, use categoryId endpoint
    if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) {
      url = `http://localhost:5000/api/products/category/${slugOrId}`;
    } else {
      // fallback: call category-by-name to find id then call again
      const catRes = await fetch(`http://localhost:5000/api/category/name/${encodeURIComponent(slugOrId)}`, { cache: 'no-store' });
      if (catRes.ok) {
        const catJson = await catRes.json();
        const cid = catJson?.data?._id || catJson?.data?.id;
        if (cid) {
          url = `http://localhost:5000/api/products/category/${cid}`;
        }
      }
      // if still no url, call generic products list (empty will be returned)
      if (!url) {
        url = `http://localhost:5000/api/products`; // will return all, filtering later in page
      }
    }

    const res = await fetch(url, { cache: "no-store" });
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

// Helper to convert category name -> slug
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

// ===== PAGE COMPONENT =====
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // find category by slug by fetching all categories
  const categories = await fetchAllCategories();
  const matched = categories.find(c => slugify(c.ten_loai) === slug);
  
  if (!matched) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#e74c3c' }}>Không tìm thấy danh mục</h2>
      </div>
    );
  }

  // load products for this category
  const products = await fetchProductsByCategorySlug(matched._id);

  return (
    <div className="product-container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>{matched.ten_loai}</h1>
      {products.length === 0 ? (
        <p>Chưa có sản phẩm nào trong danh mục này.</p>
      ) : (
        <div className="product-grid" style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {products.map(p => (
            <div key={p._id} className="product-card" style={{ border: '1px solid #ccc', padding: '10px' }}>
              <a href={`/product/${p._id}`}>
                <img src={p.hinh || '/img/no-image.jpg'} alt={p.ten_sp} style={{ width: '100%', height: 'auto' }} />
                <h3 style={{ fontSize: '16px', margin: '10px 0' }}>{p.ten_sp}</h3>
              </a>
              <div>
                <span style={{ fontWeight: 'bold' }}>
                  {p.gia_km && p.gia_km < p.gia ? p.gia_km.toLocaleString() : p.gia.toLocaleString()}đ
                </span>
                {p.gia_km && p.gia_km < p.gia && (
                  <span style={{ textDecoration: 'line-through', marginLeft: '5px' }}>
                    {p.gia.toLocaleString()}đ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

