// app/orders/components/OrderStatusBadge.tsx
"use client";

import styles from "./OrderStatusBadge.module.css";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returning" | "returned";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: styles.pending },
  confirmed: { label: "Chờ giao hàng", className: styles.confirmed },
  shipped: { label: "Vận chuyển", className: styles.shipped },
  delivered: { label: "Hoàn thành", className: styles.delivered },
  cancelled: { label: "Đã hủy", className: styles.cancelled },
  returning: { label: "Đang hoàn", className: styles.returning },
  returned: { label: "Đã hoàn", className: styles.returned },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  );
}
