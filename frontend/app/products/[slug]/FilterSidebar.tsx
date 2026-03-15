"use client";

import { useState } from "react";
import styles from "./FilterSidebar.module.css";

export interface FilterState {
  minPrice: number | "";
  maxPrice: number | "";
  sort: "default" | "price_asc" | "price_desc" | "newest";
}

interface Props {
  onFilterChange: (filters: FilterState) => void;
  totalProducts: number;
  initialFilters?: FilterState;
}

export default function FilterSidebar({
  onFilterChange,
  totalProducts,
  initialFilters,
}: Props) {
  const [sort, setSort] = useState<FilterState["sort"]>(
    initialFilters?.sort ?? "default"
  );

  const resetFilter = () => {
    setSort("default");
    onFilterChange({ minPrice: "", maxPrice: "", sort: "default" });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.filterIcon}>☰</span>
        <span>BỘ LỌC TÌM KIẾM</span>
      </div>

      {/* Sắp xếp */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Sắp xếp theo</h4>
        {[
          { value: "default", label: "Mặc định" },
          { value: "price_asc", label: "Giá: Thấp → Cao" },
          { value: "price_desc", label: "Giá: Cao → Thấp" },
          { value: "newest", label: "Mới nhất" },
        ].map((opt) => (
          <label key={opt.value} className={styles.radioLabel}>
            <input
              type="radio"
              name="sort"
              value={opt.value}
              checked={sort === opt.value}
              onChange={() => {
                const newSort = opt.value as FilterState["sort"];
                setSort(newSort);
                onFilterChange({ minPrice: "", maxPrice: "", sort: newSort });
              }}
              className={styles.radio}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.resultCount}>
        Tìm thấy <strong>{totalProducts}</strong> sản phẩm
      </div>

      <button onClick={resetFilter} className={styles.resetBtn}>
        XÓA TẤT CẢ
      </button>
    </aside>
  );
}