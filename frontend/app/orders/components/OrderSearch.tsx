// app/orders/components/OrderSearch.tsx
"use client";

import styles from "./OrderSearch.module.css";

interface OrderSearchProps {
  onSearch: (searchTerm: string) => void;
}

export default function OrderSearch({ onSearch }: OrderSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Tìm kiếm: Tên shop, ID đơn hàng, tên sản phẩm"
        onChange={handleChange}
        className={styles.searchInput}
      />
      <span className={styles.searchIcon}>🔍</span>
    </div>
  );
}
