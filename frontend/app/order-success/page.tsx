"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "./order-success.css";

interface OrderDetails {
  orderId: string;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
  deliveryAddress: string;
  phone: string;
}

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy thông tin đơn hàng từ localStorage hoặc query params
    const orderId = searchParams.get("orderId");
    const stored = localStorage.getItem("lastOrder");

    if (stored) {
      try {
        const order = JSON.parse(stored);
        setOrderDetails(order);
        localStorage.removeItem("lastOrder");
      } catch (error) {
        console.error("Error parsing order details:", error);
      }
    }

    setLoading(false);
  }, [searchParams]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        {/* Icon thành công */}
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>

        {/* Tiêu đề */}
        <h1 className="success-title">Đặt hàng thành công!</h1>
        <p className="success-message">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
        </p>

        {/* Chi tiết đơn hàng */}
        {orderDetails ? (
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Mã đơn hàng:</span>
              <span className="detail-value">{orderDetails.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày đặt hàng:</span>
              <span className="detail-value">{formatDate(orderDetails.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số lượng sản phẩm:</span>
              <span className="detail-value">{orderDetails.itemCount} mặt hàng</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Địa chỉ giao hàng:</span>
              <span className="detail-value">{orderDetails.deliveryAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số điện thoại:</span>
              <span className="detail-value">{orderDetails.phone}</span>
            </div>
            <div className="detail-row detail-total">
              <span className="detail-label">Tổng cộng:</span>
              <span className="detail-value total-price">
                {formatCurrency(orderDetails.totalPrice)}
              </span>
            </div>
          </div>
        ) : (
          <div className="no-details">
            <p>Không tìm thấy thông tin đơn hàng. Vui lòng liên hệ hỗ trợ.</p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="action-buttons">
          <Link href="/profile/orders" className="btn-view-orders">
            <i className="fas fa-box"></i> Xem đơn hàng của tôi
          </Link>
          <Link href="/" className="btn-continue-shopping">
            <i className="fas fa-shopping-bag"></i> Tiếp tục mua sắm
          </Link>
        </div>

        {/* Thông tin hỗ trợ */}
        <div className="support-info">
          <p>
            Nếu bạn có câu hỏi, vui lòng <a href="mailto:support@example.com">liên hệ với chúng tôi</a>
          </p>
        </div>
      </div>
    </div>
  );
}
