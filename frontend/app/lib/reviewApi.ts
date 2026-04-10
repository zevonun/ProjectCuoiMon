import { apiFetch } from "./apiClient";

export type ProductReview = {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const res = await apiFetch(`/api/reviews/product/${productId}`, { method: "GET" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Không thể tải đánh giá");
  return Array.isArray(json?.data) ? json.data : [];
}

export async function canReviewOrder(orderId: string): Promise<{ reviewedProductIds: string[]; canReview: boolean }> {
  const res = await apiFetch(`/api/reviews/can-review?orderId=${encodeURIComponent(orderId)}`, { method: "GET" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Không thể kiểm tra trạng thái đánh giá");
  return {
    canReview: !!json?.canReview,
    reviewedProductIds: Array.isArray(json?.reviewedProductIds) ? json.reviewedProductIds : [],
  };
}

export async function createReview(input: {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const res = await apiFetch(`/api/reviews`, { method: "POST", body: JSON.stringify(input) });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Không thể gửi đánh giá");
}

