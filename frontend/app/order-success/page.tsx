"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./order-success.css";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"success" | "error" | "processing">("success");
  const [message, setMessage] = useState("Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.");

  useEffect(() => {
    // Check for VNPay params
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");

    if (vnp_ResponseCode) {
      setStatus("processing");
      setMessage("Đang xác thực giao dịch qua VNPay...");

      if (vnp_ResponseCode === "00") {
         // Verify with backend
         const verifyVNPay = async () => {
            try {
               const queryString = searchParams.toString();
               const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vnpay/vnpay_return?${queryString}`);
               const data = await response.json();
               
               if (data.success) {
                  setStatus("success");
                  setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
               } else {
                  throw new Error(data.message || "Giao dịch không hợp lệ.");
               }
            } catch (err: any) {
               setStatus("error");
               setMessage(`Lỗi thanh toán: ${err.message}`);
            }
         };
         verifyVNPay();
      } else {
         setStatus("error");
         setMessage("Giao dịch thanh toán thất bại. Vui lòng kiểm tra lại phương thức thanh toán.");
      }
    }

    // Clear order from localStorage
    localStorage.removeItem("lastOrder");
  }, [searchParams]);

  return (
    <div className="order-success-container">
      <div className="success-card">
        {/* Icon */}
        <div className={`success-icon ${status}`}>
          <i className={`fas ${status === "success" ? "fa-check-circle" : (status === "error" ? "fa-times-circle" : "fa-spinner fa-spin")}`}></i>
        </div>

        {/* Tiêu đề */}
        <h1 className="success-title">
           {status === "success" ? "Đặt hàng thành công!" : (status === "error" ? "Thất bại" : "Đang xử lý")}
        </h1>
        <p className="success-message">{message}</p>


        {/* Nút hành động */}
        <div className="action-buttons">
          <Link href="/orders" className="btn-view-orders">
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

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
