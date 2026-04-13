'use client';

import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../lib/formatCurrency';
import styles from '../checkout.module.css';

interface Voucher {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  minOrderAmount?: number;
}

interface OrderSummaryProps {
  products: CartItem[];
  voucherCode?: string;
  voucherDiscount?: number;
  voucherInput: string;
  onVoucherInputChange: (value: string) => void;
  onApplyVoucher: () => void;
  onRemoveVoucher: () => void;
  voucherLoading?: boolean;
  voucherError?: string;
  voucherSuccess?: string;
  availableVouchers?: Voucher[];
  vouchersLoading?: boolean;
  onSelectVoucher?: (voucher: Voucher) => void;
}

const SHIPPING_FEE = 30000;

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  products,
  voucherCode,
  voucherDiscount = 0,
  voucherInput,
  onVoucherInputChange,
  onApplyVoucher,
  onRemoveVoucher,
  voucherLoading = false,
  voucherError,
  voucherSuccess,
  availableVouchers = [],
  vouchersLoading = false,
  onSelectVoucher,
}) => {
  const subtotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const total = Math.max(0, subtotal - voucherDiscount) + SHIPPING_FEE;

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

        <div className={styles.voucherBox}>
          <div className={styles.voucherForm}>
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => onVoucherInputChange(e.target.value)}
              placeholder="Nhập mã voucher hoặc chọn từ danh sách"
              className={styles.voucherInput}
              disabled={voucherLoading}
            />
            {voucherCode ? (
              <button
                type="button"
                className={styles.voucherRemoveButton}
                onClick={onRemoveVoucher}
                disabled={voucherLoading}
              >
                Bỏ mã
              </button>
            ) : (
              <button
                type="button"
                className={styles.voucherButton}
                onClick={onApplyVoucher}
                disabled={voucherLoading || !voucherInput.trim() || subtotal <= 0}
              >
                {voucherLoading ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            )}
          </div>

          {availableVouchers.length > 0 && !voucherCode && (
            <div className={styles.voucherListContainer}>
              <p className={styles.voucherListLabel}>📦 Voucher có sẵn:</p>
              <div className={styles.voucherList}>
                {availableVouchers.map((voucher) => (
                  <button
                    key={voucher.code}
                    type="button"
                    className={styles.voucherTag}
                    onClick={() => onSelectVoucher?.(voucher)}
                    disabled={voucherLoading}
                    title={voucher.description}
                  >
                    <span className={styles.voucherTagCode}>{voucher.code}</span>
                    <span className={styles.voucherTagValue}>
                      {voucher.type === 'percentage' ? `${voucher.value}%` : `${formatCurrency(voucher.value)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {voucherSuccess && (
            <div className={styles.voucherSuccess}>{voucherSuccess}</div>
          )}

          {voucherError && (
            <div className={styles.voucherError}>{voucherError}</div>
          )}
        </div>

        {voucherDiscount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              Giam voucher{voucherCode ? ' (' + voucherCode + ')' : ''}:
            </span>
            <span className={styles.summaryValue + ' ' + styles.discountValue}>
              -{formatCurrency(voucherDiscount)}
            </span>
          </div>
        )}

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
