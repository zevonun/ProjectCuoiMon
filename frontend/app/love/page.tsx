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
    return <div className={styles.loading}>Dang tai danh sach yeu thich...</div>;
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <ul className={styles.breadcrumb}>
            <li>
              <Link href="/">Trang chu</Link>
            </li>
            <li className={styles.active}>San pham yeu thich</li>
          </ul>

          <span className={styles.heroTag}>Wishlist</span>
          <h1 className={styles.title}>San pham yeu thich</h1>
          <p className={styles.subtitle}>
            Luu lai nhung mon ban quan tam de xem lai nhanh hon va dua ra quyet dinh mua sam de dang.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Da luu</span>
            <strong className={styles.statValue}>{favorites.length}</strong>
            <span className={styles.statHint}>san pham</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Meo nho</span>
            <strong className={styles.statValue}>Theo doi</strong>
            <span className={styles.statHint}>bo suu tap ban muon mua sau</span>
          </div>
        </div>
      </section>

      {favorites.length > 0 ? (
        <>
          <section className={styles.sectionBar}>
            <div>
              <h2 className={styles.sectionTitle}>Danh sach cua ban</h2>
              <p className={styles.sectionText}>
                Nhan vao san pham de xem chi tiet hoac bo khoi danh sach yeu thich ngay tai day.
              </p>
            </div>
            <Link href="/" className={styles.continueShopping}>
              Kham pha them
            </Link>
          </section>

          <section className={styles.grid}>
            {favorites.map((product) => (
              <article key={product._id} className={styles.favoriteCard}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveFavorite(product._id)}
                  aria-label={`Bo ${product.ten_sp} khoi yeu thich`}
                >
                  x
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
          <span className={styles.emptyBadge}>Wishlist</span>
          <div className={styles.emptyIcon}>LOVE</div>
          <h3>Danh sach yeu thich con trong</h3>
          <p>
            Hay dao quanh cua hang va luu lai nhung san pham ban muon xem lai sau.
          </p>
          <Link href="/" className={styles.shopBtn}>
            Kham pha san pham
          </Link>
        </section>
      )}
    </div>
  );
}