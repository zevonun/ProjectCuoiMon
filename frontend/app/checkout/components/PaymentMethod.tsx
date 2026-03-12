'use client';

import React from 'react';
import { PaymentMethod as PaymentMethodType } from '../types';
import styles from '../checkout.module.css';

interface PaymentMethodProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  const paymentMethods = [
    {
      id: 'COD',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán tiền mặt khi nhận hàng',
      icon: '💰',
    },
    {
      id: 'MOMO',
      name: 'Thanh toán MoMo',
      description: 'Ví điện tử MoMo',
      icon: '📱',
    },
    {
      id: 'VNPAY',
      name: 'Thanh toán VNPay',
      description: 'Cổng thanh toán VNPay',
      icon: '💳',
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>4</span>
        <h2 className={styles.sectionTitle}>Phương thức thanh toán</h2>
      </div>

      <div className={styles.paymentMethodsContainer}>
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`${styles.paymentMethodOption} ${
              selectedMethod === method.id ? styles.selected : ''
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodChange(method.id as PaymentMethodType)}
              className={styles.radioInput}
            />
            <div className={styles.paymentMethodContent}>
              <div className={styles.paymentMethodIcon}>{method.icon}</div>
              <div className={styles.paymentMethodText}>
                <p className={styles.paymentMethodName}>{method.name}</p>
                <p className={styles.paymentMethodDescription}>
                  {method.description}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
