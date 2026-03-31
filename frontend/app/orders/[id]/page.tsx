// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { getOrderDetails, Order } from "../lib/orderApi";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(
          err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonContent}></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Lỗi</h2>
          <p>{error || "Không tìm thấy đơn hàng"}</p>
          <Link href="/orders" className={styles.backBtn}>
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Chờ xác nhận", icon: "📋" },
      { key: "confirmed", label: "Đã xác nhận", icon: "✓" },
      { key: "shipped", label: "Đang giao", icon: "🚚" },
      { key: "delivered", label: "Đã giao", icon: "📦" },
    ];

    const statusOrder = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      active: idx === currentIndex,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/orders" className={styles.backBtn}>
          ← Quay lại danh sách
        </Link>
        <h1>Chi tiết đơn hàng #{order.orderId}</h1>
      </div>

      {/* Status Timeline */}
      <div className={styles.statusTimeline}>
        <div className={styles.timelineContainer}>
          {getStatusSteps().map((step, idx) => (
            <div key={step.key} className={styles.timelineStep}>
              <div
                className={`${styles.stepCircle} ${
                  step.completed ? styles.completed : ""
                } ${step.active ? styles.active : ""}`}
              >
                <span>{step.icon}</span>
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
              {idx < getStatusSteps().length - 1 && (
                <div
                  className={`${styles.stepLine} ${
                    getStatusSteps()[idx + 1].completed ? styles.completed : ""
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {/* Order Info */}
        <section className={styles.section}>
          <h2>Thông tin đơn hàng</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Mã đơn hàng:</span>
              <span className={styles.value}>#{order.orderId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Trạng thái:</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Ngày đặt:</span>
              <span className={styles.value}>{formatDate(order.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Phương thức thanh toán:</span>
              <span className={styles.value}>
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : order.paymentMethod === "MOMO"
                  ? "MoMo"
                  : "VNPay"}
              </span>
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className={styles.section}>
          <h2>Thông tin giao hàng</h2>
          <div className={styles.customerInfo}>
            <p>
              <strong>Tên khách hàng:</strong> {order.customerInfo.fullName}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {order.customerInfo.phone}
            </p>
            <p>
              <strong>Email:</strong> {order.customerInfo.email}
            </p>
            <p>
              <strong>Địa chỉ giao hàng:</strong> {order.customerInfo.address}
            </p>
            <p>
              <strong>Tỉnh/Thành phố:</strong> {order.customerInfo.province}
            </p>
            {order.customerInfo.notes && (
              <p>
                <strong>Ghi chú:</strong> {order.customerInfo.notes}
              </p>
            )}
          </div>
        </section>

        {/* Products */}
        <section className={styles.section}>
          <h2>Sản phẩm</h2>
          <div className={styles.productsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Sản phẩm</div>
              <div className={styles.col2}>Số lượng</div>
              <div className={styles.col3}>Giá</div>
              <div className={styles.col4}>Tổng</div>
            </div>
            {order.products.map((product, idx) => (
              <div key={idx} className={styles.tableRow}>
                <div className={styles.col1}>
                  <div className={styles.productInfo}>
                    <div className={styles.productPlaceholder}>📦</div>
                    <div>
                      <div className={styles.productName}>
                        Sản phẩm #{idx + 1}
                      </div>
                      <div className={styles.productId}>
                        ID: {product.productId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.col2}>{product.quantity}</div>
                <div className={styles.col3}>
                  {product.price.toLocaleString()} đ
                </div>
                <div className={styles.col4}>
                  {(product.price * product.quantity).toLocaleString()} đ
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Summary */}
        <section className={styles.section}>
          <h2>Chi tiết thanh toán</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingRow}>
              <span>Tổng giá sản phẩm:</span>
              <span>
                {(
                  order.totalPrice - (order.shippingFee || 0)
                ).toLocaleString()}{" "}
                đ
              </span>
            </div>
            <div className={styles.pricingRow}>
              <span>Phí vận chuyển:</span>
              <span>{(order.shippingFee || 0).toLocaleString()} đ</span>
            </div>
            <div className={`${styles.pricingRow} ${styles.total}`}>
              <span>Tổng thanh toán:</span>
              <span>{order.totalPrice.toLocaleString()} đ</span>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <Link href="/orders" className={styles.backLink}>
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );
}
