"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductSlider.module.css";
import { Product, fetchProducts } from "../lib/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface SliderProps {
  title: string;
  iconUrl: string;
  apiUrl: string;
}

export default function ProductSlider({ title, iconUrl, apiUrl }: SliderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    if (!apiUrl) return;
    const loadProducts = async () => {
      const data = await fetchProducts(apiUrl);
      setProducts(data);
    };
    loadProducts();
  }, [apiUrl]);

  const totalSlides = Math.ceil(products.length / itemsPerPage) || 1;
  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(totalSlides - 1, prev + 1));

  return (
    <section className={styles.cardSection}>
      <div className={styles.cardHeader}>
        <img src={iconUrl} alt={title} width={40} height={40} />
        <h2>{title}</h2>
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.sliderWrapper}>
          <div
            className={styles.sliderTrack}
            style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: "0.5s ease-in-out" }}
          >
            {products.map((product, index) => (
              <div key={product._id || index} className={styles.sliderItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {totalSlides > 1 && (
          <>
            <button className={`${styles.sliderButton} ${styles.prev}`} onClick={handlePrev} disabled={currentIndex === 0}>
              <FaChevronLeft />
            </button>
            <button className={`${styles.sliderButton} ${styles.next}`} onClick={handleNext} disabled={currentIndex >= totalSlides - 1}>
              <FaChevronRight />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
