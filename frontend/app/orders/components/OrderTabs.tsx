// app/orders/components/OrderTabs.tsx
"use client";

import styles from "./OrderTabs.module.css";

type TabStatus = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returning" | "returned";

interface OrderTabsProps {
  activeTab: TabStatus;
  onTabChange: (tab: TabStatus) => void;
}

const tabs: { label: string; value: TabStatus }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Chờ giao hàng", value: "confirmed" },
  { label: "Vận chuyển", value: "shipped" },
  { label: "Hoàn thành", value: "delivered" },
  { label: "Trả hàng", value: "returning" },
  { label: "Đã hủy", value: "cancelled" },
];

export default function OrderTabs({ activeTab, onTabChange }: OrderTabsProps) {
  return (
    <div className={styles.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`${styles.tab} ${activeTab === tab.value ? styles.active : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
