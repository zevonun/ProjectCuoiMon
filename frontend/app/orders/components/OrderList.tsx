// app/orders/components/OrderList.tsx
"use client";

import styles from "./OrderList.module.css";
import OrderItem from "./OrderItem";
import { Order } from "../lib/orderApi";

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  isEmpty: boolean;
  onCancel: (orderId: string) => Promise<void>;
  onUpdateAddress: (orderId: string, address: any) => Promise<void>;
  onReview?: (orderId: string) => void;
  onRepurchase?: (orderId: string) => void;
}

// Skeleton loader component
function SkeletonOrderItem() {
  return (
    <div className={styles.skeletonItem}>
      <div className={styles.skeletonHeader}></div>
      <div className={styles.skeletonContent}></div>
      <div className={styles.skeletonFooter}></div>
    </div>
  );
}

export default function OrderList({
  orders,
  isLoading,
  isEmpty,
  onCancel,
  onUpdateAddress,
  onReview,
  onRepurchase,
}: OrderListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.listContainer}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonOrderItem key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📦</div>
        <h3>Không có đơn hàng</h3>
        <p>Bạn chưa có đơn hàng nào trong danh mục này.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {orders.map((order) => (
        <OrderItem
          key={order._id}
          order={order}
          onCancel={onCancel}
          onUpdateAddress={onUpdateAddress}
          onReview={onReview}
          onRepurchase={onRepurchase}
        />
      ))}
    </div>
  );
}
