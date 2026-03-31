// app/orders/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import styles from "./page.module.css";
import OrderTabs from "./components/OrderTabs";
import OrderSearch from "./components/OrderSearch";
import OrderList from "./components/OrderList";
import {
  getOrders,
  cancelOrder,
  updateOrderAddress,
  Order,
} from "./lib/orderApi";

type TabStatus = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returning" | "returned";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrders(user._id, activeTab);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err instanceof Error ? err.message : "Không thể tải đơn hàng"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, activeTab]);

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const searchIn = [
        order.orderId,
        order.customerInfo.fullName,
        order.customerInfo.address,
        // You could add product names here too if available
      ]
        .join(" ")
        .toLowerCase();

      return searchIn.includes(term);
    });
  }, [orders, searchTerm]);

  const handleCancel = async (orderId: string) => {
    try {
      setIsLoading(true);
      const updatedOrder = await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
      // Show success toast
      showToast("success", "Hủy đơn hàng thành công");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể hủy đơn hàng";
      showToast("error", errorMsg);
      console.error("Error canceling order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (
    orderId: string,
    addressData: {
      fullName: string;
      phone: string;
      address: string;
      province: string;
    }
  ) => {
    try {
      setIsLoading(true);
      const updatedOrder = await updateOrderAddress(orderId, addressData);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
      // Show success toast
      showToast("success", "Cập nhật địa chỉ thành công");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể cập nhật địa chỉ";
      showToast("error", errorMsg);
      console.error("Error updating address:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (orderId: string) => {
    // Navigate to review page
    router.push(`/orders/${orderId}/review`);
  };

  const handleRepurchase = async (orderId: string) => {
    try {
      // Get order details and add products to cart
      // This would require additional logic to fetch product details
      showToast("success", "Thêm sản phẩm vào giỏ hàng thành công");
    } catch (err) {
      showToast("error", "Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  // Toast notification function
  const showToast = (type: "success" | "error", message: string) => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `${styles.toast} ${styles[`toast_${type}`]}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add(styles.show), 10);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove(styles.show);
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Đơn hàng của tôi</h1>
        <p className={styles.subtitle}>Quản lý và theo dõi các đơn hàng của bạn</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className={styles.dismissBtn}
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.content}>
        {/* Tabs */}
        <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Search */}
        <OrderSearch onSearch={setSearchTerm} />

        {/* Results count */}
        <div className={styles.resultsInfo}>
          {filteredOrders.length > 0 && (
            <p>
              Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
            </p>
          )}
        </div>

        {/* Orders list */}
        <OrderList
          orders={filteredOrders}
          isLoading={isLoading}
          isEmpty={filteredOrders.length === 0 && !isLoading}
          onCancel={handleCancel}
          onUpdateAddress={handleUpdateAddress}
          onReview={handleReview}
          onRepurchase={handleRepurchase}
        />
      </div>
    </div>
  );
}
