"use client";

import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import "./cart-page.css"; // Bạn sẽ tạo file này ở bước sau

// Định dạng tiền Việt Nam
const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN") + "đ";
};

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    itemCount,
  } = useCart();

  if (itemCount === 0) {
    return (
      <div className="cart-container product-container" style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 className="cart-title">Giỏ hàng trống</h1>
        <p style={{ fontSize: "18px", color: "#666", margin: "20px 0" }}>
          Bạn chưa có sản phẩm nào trong giỏ hàng.
        </p>
        <Link href="/" className="btn-continue-shopping">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container product-container">
      <h1 className="cart-title">Giỏ hàng của bạn ({itemCount} sản phẩm)</h1>

      <div className="cart-content">
        {/* Danh sách sản phẩm */}
        <div className="cart-items">
          {cartItems.map((item) => {
            const p = item.product; // Dễ đọc hơn
            return (
              <div className="cart-item" key={p._id}>
                {/* Ảnh + Tên */}
                <div className="cart-product-info">
                  <Image
                    src={p.hinh || "/img/no-image.jpg"}
                    alt={p.ten_sp}
                    width={80}
                    height={80}
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div className="product-details">
                    <Link href={`/product/${p._id}`} className="product-name">
                      {p.ten_sp}
                    </Link>
                    {p.gia_km && p.gia_km < p.gia && (
                      <div className="price-old">
                        {formatCurrency(p.gia_km)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="cart-item-price">
                  {formatCurrency(p.gia_km && p.gia_km < p.gia ? p.gia_km : p.gia)}
                </div>

                {/* Số lượng */}
                <div className="cart-item-quantity">
                  <div className="quantity-controls-cart">
                    <button
                      className="qty-btn-cart minus"
                      onClick={() => updateQuantity(p._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      readOnly
                      className="qty-input-cart"
                    />
                    <button
                      className="qty-btn-cart plus"
                      onClick={() => updateQuantity(p._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Thành tiền */}
                <div className="cart-item-total-price">
                  {formatCurrency(
                    (p.gia_km && p.gia_km < p.gia ? p.gia_km : p.gia) * item.quantity
                  )}
                </div>

                {/* Xóa */}
                <div className="cart-item-remove">
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(p._id)}
                    title="Xóa khỏi giỏ hàng"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="summary-row">
            <span>Tạm tính ({itemCount} sản phẩm):</span>
            <strong>{formatCurrency(totalPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>Miễn phí / Tính khi thanh toán</span>
          </div>
          <div className="summary-total">
            <span>Tổng cộng:</span>
            <span className="total-price-final">{formatCurrency(totalPrice)}</span>
          </div>

          <Link href="/checkout" className="btn-checkout">
            Tiến hành thanh toán
          </Link>

          <Link href="/" className="btn-continue-shopping-small">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}