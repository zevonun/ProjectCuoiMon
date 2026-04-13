// app/orders/components/OrderItem.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./OrderItem.module.css";
import OrderStatusBadge from "./OrderStatusBadge";
import ChangeAddressModal from "./ChangeAddressModal";
import { Order, OrderProduct, getOrderProductDetails } from "../lib/orderApi";
import { formatPrice } from "../../lib/formatPrice";

interface OrderItemProps {
  order: Order;
  onCancel: (orderId: string) => Promise<void>;
  onUpdateAddress: (orderId: string, address: any) => Promise<void>;
  onReview?: (orderId: string) => void;
  onRepurchase?: (orderId: string) => void;
}

export default function OrderItem({
  order,
  onCancel,
  onUpdateAddress,
  onReview,
  onRepurchase,
}: OrderItemProps) {
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    
    try {
      setIsLoadingCancel(true);
      await onCancel(order._id);
    } finally {
      setIsLoadingCancel(false);
    }
  };

  const handleAddressUpdate = async (address: any) => {
    try {
      await onUpdateAddress(order._id, address);
      setShowAddressModal(false);
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  // Kiểm tra trạng thái để hiển thị nút hành động
  const canCancelOrEdit = order.status === "pending";
  const canReview = order.status === "delivered";

  return (
    <>
      <div className={styles.orderItem}>
        {/* Header: Info shop + status + orderId */}
        <div className={styles.orderHeader}>
          <div className={styles.shopInfo}>
            <div className={styles.shopName}>
              <i className="fas fa-store"></i> Cửa hàng mặc định
            </div>
            <div className={styles.orderId}>#{order.orderId}</div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Products list */}
        <div className={styles.productsContainer}>
          {order.products.map((product, idx) => {
            const productDetails = getOrderProductDetails(product);
            const productImage = productDetails?.image || '/img/da.png';
            const productName = productDetails?.name || `Sản phẩm #${idx + 1}`;
            
            // Resolve image URL
            let imageUrl = productImage;
            if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }

            return (
              <div key={idx} className={styles.productRow}>
                {/* Product Image */}
                <div className={styles.productImage}>
                  {productDetails ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      onError={(e) => {
                        e.currentTarget.src = '/img/da.png';
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>📦</div>
                  )}
                </div>

                {/* Product info */}
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{productName}</div>
                  <div className={styles.productDetails}>
                    x{product.quantity} | {formatPrice(product.price)}
                  </div>
                </div>

                {/* Price per product */}
                <div className={styles.productPrice}>
                  {formatPrice(product.price * product.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total price section */}
        <div className={styles.totalSection}>
          <div className={styles.totalLabel}>Tổng tiền:</div>
          <div className={styles.totalPrice}>
            {formatPrice(order.totalPrice)}
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          {/* Show action buttons only for pending orders */}
          {canCancelOrEdit ? (
            <>
              <button
                className={`${styles.actionBtn} ${styles.secondary}`}
                onClick={() => setShowAddressModal(true)}
              >
                Thay đổi địa chỉ
              </button>
              <button
                className={`${styles.actionBtn} ${styles.danger}`}
                onClick={handleCancel}
                disabled={isLoadingCancel}
              >
                {isLoadingCancel ? "Đang hủy..." : "Hủy đơn"}
              </button>
            </>
          ) : null}

          {/* Show review and repurchase for completed orders */}
          {canReview ? (
            <>
              <button
                className={`${styles.actionBtn} ${styles.secondary}`}
                onClick={() => onRepurchase?.(order._id)}
              >
                Mua lại
              </button>
              {!order.isReviewed && (
                <button
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={() => onReview?.(order._id)}
                >
                  Đánh giá
                </button>
              )}
            </>
          ) : null}

          {/* View details for all orders */}
          <Link href={`/orders/${order._id}`} className={`${styles.actionBtn} ${styles.info}`}>
            Chi tiết
          </Link>
        </div>
      </div>

      {/* Change address modal */}
      {showAddressModal && (
        <ChangeAddressModal
          isOpen={showAddressModal}
          currentAddress={{
            fullName: order.customerInfo.fullName,
            phone: order.customerInfo.phone,
            address: order.customerInfo.address,
            province: order.customerInfo.province,
          }}
          onSubmit={handleAddressUpdate}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </>
  );
}
