"use client";

import { useEffect, useState } from "react";
import styles from "./ProductSlider.module.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  sale: number;
  image: string;
}

interface ProductSliderProps {
  title: string;
  iconUrl: string;
  apiUrl: string; 
}

export default function ProductSlider({ title, iconUrl, apiUrl }: ProductSliderProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Fetch lỗi! Status: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.titleBox}>
        <img src={iconUrl} className={styles.icon} />
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.slider}>
        {products.map((p) => (
          <div key={p._id} className={styles.productCard}>
            <img src={p.image || "/img/no-image.jpg"} className={styles.productImage} />
            <p className={styles.productName}>{p.name}</p>
            <p className={styles.productPrice}>
              {p.price.toLocaleString("vi-VN")}đ
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
