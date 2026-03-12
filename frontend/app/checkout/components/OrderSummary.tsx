'use client';

import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../lib/formatCurrency';
import styles from '../checkout.module.css';

interface OrderSummaryProps {
  products: CartItem[];
}

const SHIPPING_FEE = 30000;

export const OrderSummary: React.FC<OrderSummaryProps> = ({ products }) => {
  const subtotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const total = subtotal + SHIPPING_FEE;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>3</span>
        <h2 className={styles.sectionTitle}>Tóm tắt đơn hàng</h2>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Tổng tiền sản phẩm:</span>
          <span className={styles.summaryValue}>
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Phí vận chuyển:</span>
          <span className={styles.summaryValue}>
            {formatCurrency(SHIPPING_FEE)}
          </span>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryRow + ' ' + styles.total}>
          <span className={styles.summaryLabel}>Tổng thanh toán:</span>
          <span className={styles.summaryValue + ' ' + styles.totalAmount}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};
