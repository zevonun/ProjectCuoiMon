"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./order-success.css";

export default function OrderSuccess() {
  useEffect(() => {
    // Clear order from localStorage when component mounts
    const stored = localStorage.getItem("lastOrder");
    if (stored) {
      try {
        localStorage.removeItem("lastOrder");
      } catch (error) {
        console.error("Error clearing order details:", error);
      }
    }
  }, []);

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
