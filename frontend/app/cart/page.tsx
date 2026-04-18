"use client";

import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import "./cart-page.css"; // Bạn sẽ tạo file này ở bước sau
import { formatPrice } from "../lib/formatPrice";

// Định dạng tiền Việt Nam
const formatCurrency = (value: number) => {
  return formatPrice(value);
};

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    itemCount,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedPrice,
    selectedCount,
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
          {/* Header Row */}
          <div className="cart-header">
            <div className="header-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.size > 0 && selectedItems.size === cartItems.length}
                onChange={(e) => e.target.checked ? selectAllItems() : deselectAllItems()}
                className="header-checkbox-input"
              />
            </div>
            <div className="header-product">Sản Phẩm</div>
            <div className="header-price">Đơn Giá</div>
            <div className="header-quantity">Số Lượng</div>
            <div className="header-total">Thành Tiền</div>
            <div className="header-action">Thao Tác</div>
          </div>

          {cartItems.map((item) => {
            const p = item.product;
            const stock = Math.max(0, Number(p.stock) || 0);
            const isSelected = selectedItems.has(p._id);
            return (
              <div className="cart-item" key={p._id}>
                {/* Checkbox */}
                <div className="cart-item-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(p._id)}
                    id={`select-${p._id}`}
                    className="item-checkbox"
                  />
                </div>

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
                      type="button"
                      className="qty-btn-cart plus"
                      onClick={() => updateQuantity(p._id, item.quantity + 1)}
                      disabled={stock <= 0 || item.quantity >= stock}
                      title={item.quantity >= stock ? "Đã đạt số lượng tối đa trong kho" : "Tăng số lượng"}
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
            <span>Tạm tính ({selectedCount} mặt hàng được chọn):</span>
            <strong>{formatCurrency(selectedPrice)}</strong>
          </div>
          <div className="summary-total">
            <span>Tổng cộng:</span>
            <span className="total-price-final">{formatCurrency(selectedPrice)}</span>
          </div>

          <Link 
            href={selectedItems.size === 0 ? "#" : "/checkout"} 
            className={`btn-checkout ${selectedItems.size === 0 ? "disabled" : ""}`}
            onClick={(e) => {
              if (selectedItems.size === 0) {
                e.preventDefault();
              }
            }}
          >
            {selectedItems.size === 0 ? "Vui lòng chọn sản phẩm" : "Tiến hành thanh toán"}
          </Link>

          <Link href="/" className="btn-continue-shopping-small">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}