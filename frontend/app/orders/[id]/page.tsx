// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { getOrderDetails, getOrderProductId, Order } from "../lib/orderApi";
import { formatPrice } from "../../lib/formatPrice";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, any>>({}); // Cache sản phẩm

  // Lấy chi tiết sản phẩm
  const fetchProductDetails = async (productIds: string[]) => {
    try {
      console.log('📦 Fetching products for IDs:', productIds);
      
      // Lấy tất cả sản phẩm từ API
      const res = await fetch('http://localhost:5000/api/products');
      if (!res.ok) {
        console.error('❌ Failed to fetch products:', res.status);
        return;
      }
      
      const json = await res.json();
      console.log('Raw API response:', json);
      
      const allProducts = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      console.log('✅ All products loaded:', allProducts.length);
      console.log('First product:', allProducts[0]);
      
      // Tạo map theo ID - thử cả _id và id
      const details: Record<string, any> = {};
      const API_URL = 'http://localhost:5000';
      
      allProducts.forEach((p: any) => {
        const id = p._id || p.id;
        let imageUrl = p.hinh || p.image || '/img/no-image.jpg';
        
        // Resolve relative paths
        if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          imageUrl = `${API_URL}${imageUrl}`;
        }
        
        console.log(`Mapping product: ${id} -> ${p.ten_sp || p.name} (image: ${imageUrl})`);
        
        details[id] = {
          ten_sp: p.ten_sp || p.name || 'Sản phẩm',
          hinh: imageUrl,
          gia: p.gia || p.price || 0,
        };
      });
      
      console.log('✅ Product map created:', Object.keys(details).length, 'items');
      console.log('Looking for product IDs:', productIds);
      productIds.forEach(id => {
        console.log(`  - ${id}: ${details[id]?.ten_sp || 'NOT FOUND'}`);
      });
      
      setProductDetails(details);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrderDetails(orderId);
        setOrder(data);
        
        // Lấy chi tiết sản phẩm
        const productIds = data.products.map(getOrderProductId).filter(Boolean);
        await fetchProductDetails(productIds);
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
            {order.products.map((product, idx) => {
              const pid = getOrderProductId(product);
              const productInfo = productDetails[pid];
              console.log(`Rendering product ${idx}:`, { id: pid, info: productInfo });
              
              return (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.col1}>
                    <div className={styles.productInfo}>
                      <div className={styles.productImage}>
                        {productInfo?.hinh && productInfo.hinh !== '/img/no-image.jpg' ? (
                          <Image 
                            src={productInfo.hinh} 
                            alt={productInfo.ten_sp || 'Sản phẩm'}
                            width={80}
                            height={80}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              console.error('Image error:', productInfo.hinh);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className={styles.productPlaceholder}>📦</div>
                        )}
                      </div>
                      <div>
                        <div className={styles.productName}>
                          {productInfo?.ten_sp || `Sản phẩm #${idx + 1}`}
                        </div>
                        <div className={styles.productId}>
                          ID: {pid}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.col2}>{product.quantity}</div>
                  <div className={styles.col3}>
                    {formatPrice(product.price)}
                  </div>
                  <div className={styles.col4}>
                    {formatPrice(product.price * product.quantity)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Summary */}
        <section className={styles.section}>
          <h2>Chi tiết thanh toán</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingRow}>
              <span>Tổng giá sản phẩm:</span>
              <span>
                {formatPrice(
                  order.totalPrice - (order.shippingFee || 0)
                )}
              </span>
            </div>
            <div className={styles.pricingRow}>
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(order.shippingFee || 0)}</span>
            </div>
            <div className={`${styles.pricingRow} ${styles.total}`}>
              <span>Tổng thanh toán:</span>
              <span>{formatPrice(order.totalPrice)}</span>
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
