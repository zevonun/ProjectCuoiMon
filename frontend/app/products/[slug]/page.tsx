
import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "../../lib/api";

interface Product {
  _id: string;
  id?: string;
  ten_sp: string;
  gia: number;
  gia_km?: number;
  hinh?: string;
  mo_ta?: string;
  brandId?: string;
  loaiId?: string;
  categoryId?: string;
}

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const products = await fetchProducts(
    `http://localhost:5000/api/products?category=${slug}`
  );

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "120px 20px" }}>
        <h2 style={{ fontSize: "24px", color: "#e74c3c", marginBottom: "20px" }}>
          Không tìm thấy sản phẩm
        </h2>
        <Link
          href="/"
          style={{
            color: "#007bff",
            textDecoration: "underline",
            fontSize: "18px",
          }}
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>
        Sản phẩm trong danh mục: {slug}
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.3s",
              }}
              onMouseEnter={(e) => {
                const elem = e.currentTarget as HTMLDivElement;
                elem.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                const elem = e.currentTarget as HTMLDivElement;
                elem.style.transform = "scale(1)";
              }}
            >
              {product.hinh && (
                <Image
                  src={product.hinh}
                  alt={product.ten_sp}
                  width={250}
                  height={250}
                  style={{ objectFit: "cover", width: "100%", height: "auto" }}
                />
              )}
              <div style={{ padding: "15px" }}>
                <h3 style={{ margin: "10px 0", fontSize: "16px" }}>
                  {product.ten_sp}
                </h3>
                <p style={{ color: "#666", margin: "10px 0" }}>
                  {product.gia_km ? (
                    <>
                      <span style={{ textDecoration: "line-through", marginRight: "10px" }}>
                        {product.gia.toLocaleString()} đ
                      </span>
                      <span style={{ color: "#e74c3c", fontWeight: "bold" }}>
                        {product.gia_km.toLocaleString()} đ
                      </span>
                    </>
                  ) : (
                    <span style={{ fontWeight: "bold" }}>
                      {product.gia.toLocaleString()} đ
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
