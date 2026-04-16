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
  onClearVoucher: () => void;
  subtotal: number;
  loading?: boolean;
  vouchersLoading?: boolean;
  error?: string;
  success?: string;
}

export const VoucherPicker: React.FC<VoucherPickerProps> = ({
  availableVouchers,
  selectedVoucher,
  onSelectVoucher,
  onClearVoucher,
  subtotal,
  loading = false,
  vouchersLoading = false,
  error,
  success,
}) => {
  const [showModal, setShowModal] = useState(false);

  const usable = availableVouchers.filter((voucher) => {
    const enoughOrderValue =
      !voucher.minOrderAmount || subtotal >= voucher.minOrderAmount;
    const hasRemainingUsage =
      voucher.usageLimit === undefined ||
      voucher.usedCount === undefined ||
      voucher.usedCount < voucher.usageLimit;

    return enoughOrderValue && hasRemainingUsage;
  });

  const unusable = availableVouchers.filter(
    (voucher) =>
      !usable.some((usableVoucher) => usableVoucher.code === voucher.code)
  );

  const getVoucherIcon = (type: Voucher['type']) =>
    type === 'percentage' ? '%' : 'VND';

  const getVoucherLabel = (voucher: Voucher) =>
    voucher.type === 'percentage'
      ? `Giam ${voucher.value}%`
      : `Giam ${(voucher.value / 1000).toFixed(0)}k`;

  const getVoucherDiscount = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return Math.round((subtotal * voucher.value) / 100);
    }

    return Math.min(voucher.value, subtotal);
  };

  const renderVoucherCard = (voucher: Voucher, disabled = false) => {
    const isSelected = selectedVoucher?.code === voucher.code;

    return (
      <button
        key={voucher.code}
        type="button"
        className={`${styles.voucherCard} ${isSelected ? styles.selected : ''} ${
          disabled ? styles.disabled : ''
        }`}
        onClick={() => {
          if (!disabled) {
            onSelectVoucher(voucher);
          }
        }}
        disabled={disabled || loading}
      >
        <div className={styles.voucherCardLeft}>
          <div className={styles.voucherCardIcon}>{getVoucherIcon(voucher.type)}</div>
        </div>

        <div className={styles.voucherCardMiddle}>
          <div className={styles.voucherCardTitle}>{getVoucherLabel(voucher)}</div>
          <div className={styles.voucherCardDesc}>
            {voucher.description || 'Voucher giam gia cho don hang cua ban'}
          </div>
          <div className={styles.voucherCardCondition}>
            Giam tam tinh: {(getVoucherDiscount(voucher) / 1000).toFixed(0)}k
          </div>
          {!!voucher.minOrderAmount && (
            <div className={styles.voucherCardCondition}>
              Don toi thieu {(voucher.minOrderAmount / 1000).toFixed(0)}k
            </div>
          )}
        </div>

        <div className={styles.voucherCardRight}>
          <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
            {disabled ? 'x' : isSelected ? '?' : ''}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={styles.voucherPickerSection}>
      {selectedVoucher ? (
        <div className={styles.appliedVoucherBanner}>
          <div className={styles.appliedVoucherInfo}>
            <span className={styles.appliedVoucherCode}>
              Da chon: {selectedVoucher.code}
            </span>
            <span className={styles.appliedVoucherDiscount}>
              Giam: {(getVoucherDiscount(selectedVoucher) / 1000).toFixed(1)}k
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={styles.changeVoucherBtn}
              onClick={() => setShowModal(true)}
            >
              Doi voucher
            </button>
            <button
              type="button"
              className={styles.changeVoucherBtn}
              onClick={onClearVoucher}
            >
              Bo chon
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.openVoucherPickerBtn}
          onClick={() => setShowModal(true)}
        >
          Chon voucher
        </button>
      )}

      {error && <div className={styles.voucherError}>{error}</div>}
      {success && <div className={styles.voucherSuccess}>{success}</div>}

      {showModal && (
        <div className={styles.voucherModal}>
          <div className={styles.voucherModalContent}>
            <div className={styles.voucherModalHeader}>
              <h2>Chon voucher</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                x
              </button>
            </div>

            {vouchersLoading ? (
              <div className={styles.noVouchers}>Dang tai danh sach voucher...</div>
            ) : availableVouchers.length === 0 ? (
              <div className={styles.noVouchers}>Hien tai chua co voucher kha dung</div>
            ) : (
              <div className={styles.vouchersContainer}>
                {usable.length > 0 && (
                  <div className={styles.voucherSection}>
                    <h3 className={styles.voucherSectionTitle}>
                      Voucher co the dung ({usable.length})
                    </h3>
                    <div className={styles.voucherList}>
                      {usable.map((voucher) => renderVoucherCard(voucher))}
                    </div>
                  </div>
                )}

                {unusable.length > 0 && (
                  <div className={styles.voucherSection}>
                    <h3 className={styles.voucherSectionTitle}>
                      Chua du dieu kien ap dung
                    </h3>
                    <div className={styles.voucherList}>
                      {unusable.map((voucher) => renderVoucherCard(voucher, true))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.voucherModalFooter}>
              {selectedVoucher ? (
                <div className={styles.footerInfo}>
                  Dang chon {selectedVoucher.code} - giam {(getVoucherDiscount(selectedVoucher) / 1000).toFixed(1)}k
                </div>
              ) : (
                <div className={styles.footerInfo}>Chon voucher phu hop cho don hang</div>
              )}
              <button
                type="button"
                className={styles.confirmVoucherBtn}
                onClick={() => setShowModal(false)}
              >
                Xac nhan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
