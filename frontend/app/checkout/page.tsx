'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from './components/CustomerForm';
import { ProductList } from './components/ProductList';
import { OrderSummary } from './components/OrderSummary';
import { PaymentMethod } from './components/PaymentMethod';
import {
  CartItem,
  CustomerInfo,
  FormErrors,
  PaymentMethod as PaymentMethodType,
  Order,
} from './types';
import { validateCustomerInfo } from './lib/validation';
import { createOrder as createOrderApi } from './lib/orderApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import styles from './checkout.module.css';

const SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const router = useRouter();

  // Use contexts
  const { cartItems, clearCart } = useCart();
  const { user, customerInfo: authCustomerInfo, updateCustomerInfo, isLoggedIn } = useAuth();
  const { createOrder, setIsLoading: setOrderLoading, isLoading: orderLoading } = useOrder();

  // Local states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(
    authCustomerInfo || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: '',
      province: '',
      notes: '',
    }
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(orderLoading);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync cart from CartContext
  useEffect(() => {
    const checkoutCart = cartItems.map(item => ({
      id: item.product._id,
      name: item.product.ten_sp,
      price: item.product.gia_km && item.product.gia_km < item.product.gia 
        ? item.product.gia_km 
        : item.product.gia,
      quantity: item.quantity,
      image: item.product.hinh || '/img/placeholder.png',
    }));
    setCart(checkoutCart);
  }, [cartItems]);

  const handleCustomerInfoChange = (
    info: CustomerInfo,
    validationErrors: FormErrors
  ) => {
    setCustomerInfo(info);
    updateCustomerInfo(info);
    setErrors(validationErrors);
    // Clear error message when user starts editing
    if (errorMessage) setErrorMessage('');
  };

  const calculateTotal = (): number => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return subtotal + SHIPPING_FEE;
  };

  const getButtonText = (): string => {
    switch (paymentMethod) {
      case 'MOMO':
        return 'Thanh toán MoMo';
      case 'VNPAY':
        return 'Thanh toán VNPay';
      default:
        return 'Đặt hàng';
    }
  };

  const handleCheckout = async () => {
    // Validate customer info
    const validationErrors = validateCustomerInfo(customerInfo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Giỏ hàng là trống');
      return;
    }

    if (!isLoggedIn || !user) {
      setErrorMessage('Vui lòng đăng nhập để tiếp tục thanh toán');
      return;
    }

    // Create order object
    const order: Order = {
      customerInfo,
      products: cart,
      paymentMethod,
      totalPrice: calculateTotal(),
      totalProducts: cart.reduce((total, item) => total + item.quantity, 0),
      shippingFee: SHIPPING_FEE,
    };

    setOrderLoading(true);
    setIsLoading(true);

    try {
      // Save order to context
      createOrder(order);

      // Send to backend API
      const apiPayload = {
        userId: user._id,
        customerInfo,
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        totalPrice: calculateTotal(),
        shippingFee: SHIPPING_FEE,
      };

      const response = await createOrderApi(apiPayload);

      if (!response.success) {
        throw new Error(response.message || 'Tạo đơn hàng thất bại');
      }

      // Handle different payment methods
      switch (paymentMethod) {
        case 'MOMO':
          // Redirect to MoMo payment gateway
          console.log('Redirecting to MoMo payment...');
          setSuccessMessage('Chuyển hướng đến MoMo...');
          // TODO: Implement MoMo integration
          setTimeout(() => {
            clearCart();
            router.push('/');
          }, 3000);
          break;
        case 'VNPAY':
          // Redirect to VNPay payment gateway
          console.log('Redirecting to VNPay payment...');
          setSuccessMessage('Chuyển hướng đến VNPay...');
          // TODO: Implement VNPay integration
          setTimeout(() => {
            clearCart();
            router.push('/');
          }, 3000);
          break;
        default:
          // COD - order processing
          setSuccessMessage('Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn sớm.');
          
          // Clear cart and redirect
          clearCart();
          setTimeout(() => {
            router.push('/');
          }, 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
      setOrderLoading(false);
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutContent}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Thanh toán</h1>
          <p className={styles.subtitle}>Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successAlert}>
            <span>✓</span>
            <div>
              <p className={styles.alertTitle}>Thành công!</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            <span>✕</span>
            <div>
              <p className={styles.alertTitle}>Lỗi!</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <div className={styles.checkoutWrapper}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* 1. Customer Form */}
            <CustomerForm onCustomerInfoChange={handleCustomerInfoChange} />

            {/* 2. Product List */}
            <ProductList products={cart} />

            {/* 3. Order Summary */}
            <OrderSummary products={cart} />

            {/* 4. Payment Method */}
            <PaymentMethod
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            {/* Checkout Button */}
            <div className={styles.checkoutButtonContainer}>
              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className={`${styles.checkoutButton} ${
                  isLoading ? styles.loading : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Đang xử lý...
                  </>
                ) : (
                  getButtonText()
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
