"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Product } from "../../lib/api";
import CategoryProductCard from "./CategoryProductCard";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import styles from "./page.module.css";

interface Props {
  products: Product[];
  total: number;
  slug: string;
  currentFilters: FilterState;
}

const SORT_LABELS: Record<string, string> = {
  default:    "Liên Quan",
  newest:     "Mới Nhất",
  price_asc:  "Giá Thấp",
  price_desc: "Giá Cao",
};

export default function ProductsClientPage({
  products,
  total,
  slug,
  currentFilters,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  // Khi filter thay đổi → push URL mới → Next.js re-fetch server component
  const handleFilterChange = useCallback(
    (filters: FilterState) => {
      const params = new URLSearchParams();
      if (filters.minPrice !== "") params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== "") params.set("maxPrice", String(filters.maxPrice));
      if (filters.sort !== "default") params.set("sort", filters.sort);

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router]
  );

  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="/">Trang chủ</a>
        <span> / </span>
        <span>{slug}</span>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar lọc */}
        <FilterSidebar
          onFilterChange={handleFilterChange}
          totalProducts={total}
          initialFilters={currentFilters}
        />

        {/* Nội dung chính */}
        <div className={styles.contentArea}>
          {/* Sort bar */}
          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>Sắp xếp theo</span>
            {(["default", "newest", "price_asc", "price_desc"] as const).map((s) => (
              <button
                key={s}
                className={`${styles.sortBtn} ${
                  currentFilters.sort === s ? styles.sortBtnActive : ""
                }`}
                onClick={() =>
                  handleFilterChange({ ...currentFilters, sort: s })
                }
              >
                {SORT_LABELS[s]}
              </button>
            ))}
            <span className={styles.resultInfo}>{total} sản phẩm</span>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className={styles.empty}>
              <p>Không tìm thấy sản phẩm phù hợp</p>
              <button
                onClick={() =>
                  handleFilterChange({ minPrice: "", maxPrice: "", sort: "default" })
                }
                className={styles.clearBtn}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <CategoryProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
