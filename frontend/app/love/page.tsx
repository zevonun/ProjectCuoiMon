"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { fetchProductById, Product } from "../lib/api";
import styles from "./page.module.css";

export default function LovePage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const list = JSON.parse(localStorage.getItem("love_list") || "[]");

      if (list.length === 0) {
        setFavorites([]);
        return;
      }

      const promises = list.map((id: string) => fetchProductById(id));
      const results = await Promise.all(promises);
      const validProducts = results.filter((product): product is Product => product !== null);
      setFavorites(validProducts);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    const handleStorage = () => loadFavorites();
    const handleWishlistUpdated = () => loadFavorites();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, []);

  const handleRemoveFavorite = (productId: string) => {
    const currentList = JSON.parse(localStorage.getItem("love_list") || "[]");
    const nextList = currentList.filter((id: string) => id !== productId);
    localStorage.setItem("love_list", JSON.stringify(nextList));
    window.dispatchEvent(new Event("wishlistUpdated"));
    setFavorites((prev) => prev.filter((product) => product._id !== productId));
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <ul className={styles.breadcrumb}>
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className={styles.active}>Sản phẩm yêu thích</li>
          </ul>

          <span className={styles.heroTag}>Yêu thích</span>
          <h1 className={styles.title}>Sản phẩm yêu thích</h1>
          <p className={styles.subtitle}>
            Lưu lại những món bạn quan tâm để xem lại nhanh hơn và đưa ra quyết định mua sắm dễ dàng.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Đã lưu</span>
            <strong className={styles.statValue}>{favorites.length}</strong>
            <span className={styles.statHint}>sản phẩm</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Mẹo nhỏ</span>
            <strong className={styles.statValue}>Theo dõi</strong>
            <span className={styles.statHint}>bộ sưu tập bạn muốn mua sau</span>
          </div>
        </div>
      </section>

      {favorites.length > 0 ? (
        <>
          <section className={styles.sectionBar}>
            <div>
              <h2 className={styles.sectionTitle}>Danh sách của bạn</h2>
              <p className={styles.sectionText}>
                Nhấn vào sản phẩm để xem chi tiết hoặc bỏ khỏi danh sách yêu thích ngay tại đây.
              </p>
            </div>
            <Link href="/" className={styles.continueShopping}>
              Khám phá thêm
            </Link>
          </section>

          <section className={styles.grid}>
            {favorites.map((product) => (
              <article key={product._id} className={styles.favoriteCard}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveFavorite(product._id)}
                  aria-label={`Bỏ ${product.ten_sp} khỏi yêu thích`}
                >
                  ×
                </button>
                <div className={styles.cardInner}>
                  <ProductCard product={product} />
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className={styles.empty}>
          <span className={styles.emptyBadge}>Yêu thích</span>
          <div className={styles.emptyIcon} aria-hidden>
            ♡
          </div>
          <h3>Danh sách yêu thích còn trống</h3>
          <p>
            Hãy dạo quanh cửa hàng và lưu lại những sản phẩm bạn muốn xem lại sau.
          </p>
          <Link href="/" className={styles.shopBtn}>
            Khám phá sản phẩm
          </Link>
        </section>
      )}
    </div>
  );
}