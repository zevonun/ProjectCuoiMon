'use client';

import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../lib/formatCurrency';
import { resolveImageUrl } from '../../lib/image';
import styles from '../checkout.module.css';
import Image from 'next/image';

interface ProductListProps {
  products: CartItem[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>2</span>
        <h2 className={styles.sectionTitle}>Danh sách sản phẩm</h2>
      </div>

      <div className={styles.productListContainer}>
        {products.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn trống</p>
          </div>
        ) : (
          <div className={styles.productList}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  <img
                    src={resolveImageUrl(product.image)}
                    alt={product.name}
                    className={styles.image}
                  />
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productDetails}>
                    <div className={styles.priceRow}>
                      <span className={styles.label}>Giá:</span>
                      <span className={styles.price}>
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.label}>Số lượng:</span>
                      <span className={styles.quantity}>{product.quantity}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.label}>Tổng:</span>
                      <span className={styles.totalPrice}>
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
