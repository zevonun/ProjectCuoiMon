// app/product/[id]/page.tsx
// SERVER COMPONENT – CHUẨN NEXT.JS 16

import ProductDetailClient from "../../components/ProductDetailClient";
import {
  fetchProductById,
  fetchCategoryById,
  fetchRelatedProducts,
} from "../../lib/api";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← PHẢI LÀ PROMISE
}) {
  // BƯỚC DUY NHẤT: AWAIT params ĐỂ LẤY id
  const { id } = await params;

  // Bây giờ id đã có giá trị thật 100%
  const product = await fetchProductById(id);

  if (!product) {
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

  // Lấy danh mục + sản phẩm liên quan
  const category = product.categoryId
    ? await fetchCategoryById(product.categoryId)
    : undefined;

  const relatedProducts =
    product._id && category?._id
      ? await fetchRelatedProducts(product._id, category._id)
      : [];

  return (
    <ProductDetailClient
      product={product}
      category={category}
      relatedProducts={relatedProducts}
    />
  );
}