'use client';

import React, { useState } from 'react';
import styles from '../checkout.module.css';

interface Voucher {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
}

interface VoucherPickerProps {
  availableVouchers: Voucher[];
  selectedVoucher?: Voucher;
  onSelectVoucher: (voucher: Voucher) => void;
  subtotal: number;
  loading?: boolean;
  error?: string;
  success?: string;
}

export const VoucherPicker: React.FC<VoucherPickerProps> = ({
  availableVouchers,
  selectedVoucher,
  onSelectVoucher,
  subtotal,
  loading = false,
  error,
  success,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');

  // Categorize vouchers
  const categorizeVouchers = () => {
    const usable: Voucher[] = [];
    const unusable: Voucher[] = [];

    availableVouchers.forEach((v) => {
      const canUse =
        !v.minOrderAmount || subtotal >= v.minOrderAmount;
      const canApply =
        !v.usageLimit ||
        !v.usedCount ||
        v.usedCount < v.usageLimit;

      if (canUse && canApply) {
        usable.push(v);
      } else {
        unusable.push(v);
      }
    });

    return { usable, unusable };
  };

  const { usable, unusable } = categorizeVouchers();

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return '📊';
      case 'fixed':
        return '💰';
      default:
        return '🎟️';
    }
  };

  const getVoucherLabel = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return `Giảm ${voucher.value}%`;
    } else {
      return `Giảm ${(voucher.value / 1000).toFixed(0)}k`;
    }
  };

  const calculateDiscount = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return Math.round((subtotal * voucher.value) / 100);
    }
    return voucher.value;
  };

  const getAppliedVoucher = () => {
    if (selectedVoucher) {
      const discount = calculateDiscount(selectedVoucher);
      return {
        code: selectedVoucher.code,
        discount,
      };
    }
    return null;
  };

  const appliedVoucher = getAppliedVoucher();

  return (
    <div className={styles.voucherPickerSection}>
      {/* Applied Voucher Display */}
      {appliedVoucher && (
        <div className={styles.appliedVoucherBanner}>
          <div className={styles.appliedVoucherInfo}>
            <span className={styles.appliedVoucherCode}>
              ✓ {appliedVoucher.code}
            </span>
            <span className={styles.appliedVoucherDiscount}>
              Giảm: {(appliedVoucher.discount / 1000).toFixed(1)}k
            </span>
          </div>
          <button
            className={styles.changeVoucherBtn}
            onClick={() => setShowModal(true)}
          >
            Thay đổi
          </button>
        </div>
      )}

      {/* Voucher Picker Button */}
      {!appliedVoucher && (
        <button
          className={styles.openVoucherPickerBtn}
          onClick={() => setShowModal(true)}
        >
          🎟️ Chọn mã voucher
        </button>
      )}

      {/* Alerts */}
      {error && <div className={styles.voucherError}>{error}</div>}
      {success && (
        <div className={styles.voucherSuccess}>{success}</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.voucherModal}>
          <div className={styles.voucherModalContent}>
            {/* Header */}
            <div className={styles.voucherModalHeader}>
              <h2>Chọn mã voucher</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className={styles.voucherInputSection}>
              <input
                type="text"
                placeholder="Nhập mã voucher"
                className={styles.voucherSearchInput}
                value={voucherInput}
                onChange={(e) =>
                  setVoucherInput(e.target.value.toUpperCase())
                }
              />
              <button className={styles.applyInputBtn} disabled={loading}>
                Áp dụng
              </button>
            </div>

            {/* Vouchers Container */}
            <div className={styles.vouchersContainer}>
              {/* Usable Vouchers */}
              {usable.length > 0 && (
                <div className={styles.voucherSection}>
                  <h3 className={styles.voucherSectionTitle}>
                    Ưu đãi khả dụng ({usable.length})
                  </h3>
                  <div className={styles.voucherList}>
                    {usable.map((voucher) => (
                      <div
                        key={voucher.code}
                        className={`${styles.voucherCard} ${
                          selectedVoucher?.code === voucher.code
                            ? styles.selected
                            : ''
                        }`}
                        onClick={() => onSelectVoucher(voucher)}
                      >
                        <div className={styles.voucherCardLeft}>
                          <div className={styles.voucherCardIcon}>
                            {getVoucherIcon(voucher.type)}
                          </div>
                        </div>

                        <div className={styles.voucherCardMiddle}>
                          <div className={styles.voucherCardTitle}>
                            {getVoucherLabel(voucher)}
                          </div>
                          <div className={styles.voucherCardDesc}>
                            {voucher.description || 'Mã voucher'}
                          </div>
                          {voucher.minOrderAmount && (
                            <div
                              className={styles.voucherCardCondition}
                            >
                              Đơn tối thiểu{' '}
                              {(
                                voucher.minOrderAmount / 1000
                              ).toFixed(0)}
                              k
                            </div>
                          )}
                        </div>

                        <div className={styles.voucherCardRight}>
                          <div
                            className={`${styles.checkbox} ${
                              selectedVoucher?.code ===
                              voucher.code
                                ? styles.checked
                                : ''
                            }`}
                          >
                            {selectedVoucher?.code ===
                            voucher.code ? '✓' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unusable Vouchers */}
              {unusable.length > 0 && (
                <div className={styles.voucherSection}>
                  <h3 className={styles.voucherSectionTitle}>
                    Voucher không khả dụng
                  </h3>
                  <div className={styles.voucherList}>
                    {unusable.map((voucher) => (
                      <div
                        key={voucher.code}
                        className={`${styles.voucherCard} ${styles.disabled}`}
                      >
                        <div className={styles.voucherCardLeft}>
                          <div className={styles.voucherCardIcon}>
                            {getVoucherIcon(voucher.type)}
                          </div>
                        </div>

                        <div className={styles.voucherCardMiddle}>
                          <div className={styles.voucherCardTitle}>
                            {getVoucherLabel(voucher)}
                          </div>
                          <div className={styles.voucherCardDesc}>
                            {voucher.description || 'Mã voucher'}
                          </div>
                          {voucher.minOrderAmount && (
                            <div
                              className={styles.voucherCardCondition}
                            >
                              Đơn tối thiểu{' '}
                              {(
                                voucher.minOrderAmount / 1000
                              ).toFixed(0)}
                              k
                            </div>
                          )}
                        </div>

                        <div className={styles.voucherCardRight}>
                          <div className={styles.checkboxDisabled}>
                            ⊗
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableVouchers.length === 0 && (
                <div className={styles.noVouchers}>
                  Không có voucher khả dụng
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.voucherModalFooter}>
              {appliedVoucher && (
                <div className={styles.footerInfo}>
                  Đã áp dụng voucher:
                  <strong> -{(appliedVoucher.discount / 1000).toFixed(1)}k</strong>
                </div>
              )}
              <button
                className={styles.confirmVoucherBtn}
                onClick={() => setShowModal(false)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
