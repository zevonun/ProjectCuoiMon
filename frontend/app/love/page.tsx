"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { fetchProductById, Product } from "../lib/api";
import styles from "./page.module.css";

export default function LovePage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const list = JSON.parse(localStorage.getItem("love_list") || "[]");
        
        if (list.length === 0) {
          setFavorites([]);
          return;
        }

        // Fetch details for each favorite ID
        const promises = list.map((id: string) => fetchProductById(id));
        const results = await Promise.all(promises);
        
        // Filter out nulls (in case a product was deleted)
        const validProducts = results.filter((p): p is Product => p !== null);
        setFavorites(validProducts);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen to changes in other tabs
    const handleStorage = () => loadFavorites();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải danh sách yêu thích...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ul className={styles.breadcrumb}>
          <li><Link href="/">Trang chủ</Link></li>
          <li className={styles.active}>Sản phẩm yêu thích</li>
        </ul>
        <h1 className={styles.title}>SẢN PHẨM YÊU THÍCH ❤️</h1>
        <p className={styles.subtitle}>Danh sách những sản phẩm bạn đã "thả tim"</p>
      </div>

      {favorites.length > 0 ? (
        <div className={styles.grid}>
          {favorites.map((product) => (
            <div key={product._id} className={styles.cardWrapper}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💔</div>
          <h3>Danh sách yêu thích trống</h3>
          <p>Hãy dạo quanh cửa hàng và chọn những sản phẩm bạn yêu thích nhé!</p>
          <Link href="/" className={styles.shopBtn}>ĐI MUA SẮM NGAY</Link>
        </div>
      )}
    </div>
  );
}
