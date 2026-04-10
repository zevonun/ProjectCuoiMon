"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { getOrderDetails } from "../../lib/orderApi";
import { canReviewOrder, createReview } from "../../../lib/reviewApi";

type ReviewDraft = { rating: number; comment: string; submitting: boolean; done: boolean; error?: string };

export default function OrderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        setLoading(true);
        setPageError(null);
        const o = await getOrderDetails(orderId);
        setOrder(o);
        const chk = await canReviewOrder(orderId);
        setReviewed(new Set(chk.reviewedProductIds));
        if (!chk.canReview) {
          setPageError("Đơn hàng chưa hoàn thành nên chưa thể đánh giá.");
        }
      } catch (e) {
        setPageError((e as Error).message || "Không thể tải dữ liệu đánh giá");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const productIds = useMemo<string[]>(() => {
    const arr = Array.isArray(order?.products) ? order.products.map((p: any) => String(p.productId)) : [];
    return arr.filter(Boolean);
  }, [order]);

  const setDraft = (productId: string, patch: Partial<ReviewDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating ?? 5,
        comment: prev[productId]?.comment ?? "",
        submitting: prev[productId]?.submitting ?? false,
        done: prev[productId]?.done ?? false,
        error: prev[productId]?.error,
        ...patch,
      },
    }));
  };

  const submit = async (productId: string) => {
    const d = drafts[productId] || { rating: 5, comment: "", submitting: false, done: false };
    try {
      setDraft(productId, { submitting: true, error: undefined });
      await createReview({ orderId, productId, rating: d.rating, comment: d.comment });
      setDraft(productId, { submitting: false, done: true });
      setReviewed((prev) => new Set([...Array.from(prev), productId]));
      router.push("/");
    } catch (e) {
      setDraft(productId, { submitting: false, error: (e as Error).message || "Gửi đánh giá thất bại" });
    }
  };

  if (loading) {
    return <div className={styles.container}>Đang tải...</div>;
  }

  if (pageError || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Đánh giá sản phẩm</h1>
          <p className={styles.muted}>{pageError || "Không tìm thấy đơn hàng"}</p>
          <div className={styles.actions}>
            <Link href="/orders" className={styles.btnSecondary}>← Quay lại</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đánh giá sản phẩm</h1>
          <p className={styles.muted}>Đơn hàng #{order.orderId}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push(`/orders/${orderId}`)}>Chi tiết đơn</button>
          <Link href="/orders" className={styles.btnSecondary}>Danh sách đơn</Link>
        </div>
      </div>

      <div className={styles.list}>
        {productIds.map((pid, idx) => {
          const d = drafts[pid] || { rating: 5, comment: "", submitting: false, done: false };
          const already = reviewed.has(pid) || d.done;
          return (
            <div key={`${pid}-${idx}`} className={styles.item}>
              <div className={styles.itemHeader}>
                <div className={styles.productMeta}>
                  <div className={styles.productId}>Sản phẩm: {pid}</div>
                  {already ? <span className={styles.badgeDone}>Đã đánh giá</span> : <span className={styles.badgePending}>Chưa đánh giá</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Số sao</label>
                <select
                  className={styles.select}
                  value={d.rating}
                  disabled={already || d.submitting}
                  onChange={(e) => setDraft(pid, { rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} sao</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Bình luận</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  value={d.comment}
                  disabled={already || d.submitting}
                  onChange={(e) => setDraft(pid, { comment: e.target.value })}
                  rows={3}
                />
              </div>

              {d.error && <div className={styles.error}>{d.error}</div>}

              <div className={styles.itemActions}>
                <button
                  className={styles.btnPrimary}
                  disabled={already || d.submitting}
                  onClick={() => submit(pid)}
                >
                  {d.submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

