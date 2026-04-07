"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { formatPrice } from "../../lib/formatPrice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  _id: string;
  ten_sp: string;
  gia: number;
  gia_km?: number | null;
  hinh?: string;
}

// Chuẩn hóa URL ảnh: thêm API_URL nếu là đường dẫn tương đối
const resolveImage = (hinh?: string) => {
  if (!hinh) return "/img/no-image.jpg";
  if (hinh.startsWith("http")) return hinh;
  return `${API_URL}${hinh.startsWith("/") ? "" : "/"}${hinh}`;
};

export default function CategoryProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product._id}`} className={styles.productCard}>
      {product.hinh && (
        <img
          src={resolveImage(product.hinh)}
          alt={product.ten_sp}
          className={styles.productImage}
        />
      )}
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.ten_sp}</h3>
        <p className={styles.productPrice}>
          {product.gia_km && product.gia_km > 0 ? (
            <>
              <span className={styles.oldPrice}>
                {formatPrice(product.gia)}
              </span>
              <span className={styles.newPrice}>
                {formatPrice(product.gia_km)}
              </span>
            </>
          ) : (
            <span className={styles.newPrice}>
              {formatPrice(product.gia)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}