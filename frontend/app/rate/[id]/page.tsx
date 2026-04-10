"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getOrderDetails, Order } from "../../orders/lib/orderApi";
import { apiFetch } from "../../lib/apiClient";
import styles from "./page.module.css";

interface ReviewState {
  productId: string;
  rating: number;
  comment: string;
}

export default function RateOrderPage() {
  const { id: orderId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<ReviewState[]>([]);
  const [productDetails, setProductDetails] = useState<any>({});

  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderDetails(orderId as string);
        setOrder(orderData);
        
        // Khởi tạo state cho đánh giá
        const initialReviews = orderData.products.map(p => {
          const pId = (p.productId && typeof p.productId === 'object') ? (p.productId as any)._id : p.productId;
          return {
            productId: pId,
            rating: 5,
            comment: ""
          };
        });
        setReviews(initialReviews);

        // Lấy thêm thông tin tên/ảnh sản phẩm nếu backend chưa populate
        const details: any = {};
        for (const p of orderData.products) {
          const pId = (p.productId && typeof p.productId === 'object') ? (p.productId as any)._id : p.productId;
          if (!pId) continue;
          try {
            const res = await fetch(`http://localhost:5000/api/product/${pId}`);
            const json = await res.json();
            if (json.success) {
              details[pId] = json.data;
            }
          } catch (e) {
            console.error("Error fetching product detail:", e);
          }
        }
        setProductDetails(details);

      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => prev.map(r => r.productId === productId ? { ...r, rating } : r));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => prev.map(r => r.productId === productId ? { ...r, comment } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setSubmitting(true);
      const res = await apiFetch("/api/reviews/submit", {
        method: "POST",
        body: JSON.stringify({
          orderId: order._id,
          reviews
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Cảm ơn bạn đã đánh giá!");
        router.push("/orders");
      } else {
        alert(data.message || "Gửi đánh giá thất bại");
      }
    } catch (error) {
      console.error("Error submitting reviews:", error);
      alert("Lỗi server khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải thông tin...</div>;
  if (!order) return <div className={styles.error}>Không tìm thấy đơn hàng</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <h1>Đánh giá sản phẩm</h1>
        <p>Đơn hàng: #{order.orderId}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.rateForm}>
        {order.products.map((p, idx) => {
          const pId = (p.productId && typeof p.productId === 'object') ? (p.productId as any)._id : p.productId;
          if (!pId) return null;
          const detail = productDetails[pId];
          const review = reviews.find(r => r.productId === pId);
          
          return (
            <div key={idx} className={styles.productReviewCard}>
              <div className={styles.productHeader}>
                <img 
                  src={detail?.image ? `http://localhost:5000${detail.image}` : "/img/no-image.jpg"} 
                  alt={detail?.name} 
                  className={styles.pImg}
                />
                <div className={styles.pInfo}>
                  <h3>{detail?.name || `Sản phẩm #${idx + 1}`}</h3>
                  <p className={styles.price}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</p>
                </div>
              </div>

              <div className={styles.ratingSection}>
                <p>Chất lượng sản phẩm:</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={review?.rating && review.rating >= star ? styles.starActive : styles.star}
                      onClick={() => handleRatingChange(pId, star)}
                    >
                      ★
                    </span>
                  ))}
                  <span className={styles.ratingLabel}>
                    {review?.rating === 5 ? "Rất tốt" : 
                     review?.rating === 4 ? "Tốt" : 
                     review?.rating === 3 ? "Bình thường" : 
                     review?.rating === 2 ? "Tệ" : "Rất tệ"}
                  </span>
                </div>
              </div>

              <div className={styles.commentSection}>
                <textarea
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                  value={review?.comment || ""}
                  onChange={(e) => handleCommentChange(pId, e.target.value)}
                  className={styles.commentArea}
                />
              </div>
            </div>
          );
        })}

        <div className={styles.footer}>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Hoàn tất đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}
