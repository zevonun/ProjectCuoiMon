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
  PaymentMethod as PaymentMethodType,
  Order,
} from './types';
import { validateCustomerInfo } from './lib/validation';
import { createOrder as createOrderApi } from './lib/orderApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { apiPost } from '../lib/apiClient';
import styles from './checkout.module.css';

const SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const router = useRouter();

  // Use contexts
  const { cartItems, clearCart, selectedItems } = useCart();
  const { user, customerInfo: authCustomerInfo, updateCustomerInfo, isLoggedIn } = useAuth();
  const { createOrder, setIsLoading: setOrderLoading, isLoading: orderLoading, setCurrentOrder } = useOrder();

  // Local states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: authCustomerInfo?.fullName || user?.name || '',
    phone: authCustomerInfo?.phone || user?.phone || '',
    email: authCustomerInfo?.email || user?.email || '',
    address: authCustomerInfo?.address || '',
    province: authCustomerInfo?.province || '',
    notes: authCustomerInfo?.notes || '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
  const [isLoading, setIsLoading] = useState(orderLoading);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync cart from CartContext (only selected items)
  useEffect(() => {
    const checkoutCart = cartItems
      .filter(item => selectedItems.has(item.product._id))
      .map(item => ({
        id: item.product._id,
        name: item.product.ten_sp,
        price: item.product.gia_km && item.product.gia_km < item.product.gia 
          ? item.product.gia_km 
          : item.product.gia,
        quantity: item.quantity,
        image: item.product.hinh || '/img/placeholder.png',
      }));
    setCart(checkoutCart);
  }, [cartItems, selectedItems]);

  const handleCustomerInfoChange = (
    info: CustomerInfo
  ) => {
    setCustomerInfo(info);
    updateCustomerInfo(info);
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
        customerInfo: {
          fullName: customerInfo.fullName.trim(),
          phone: customerInfo.phone.trim(),
          email: customerInfo.email.trim(),
          address: customerInfo.address.trim(),
          province: customerInfo.province.trim(),
          notes: customerInfo.notes?.trim(),
        },
        products: cart.map(item => ({
          productId: String(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        paymentMethod,
        totalPrice: Number(calculateTotal()),
        shippingFee: Number(SHIPPING_FEE),
      };

      console.log('📤 Sending payload to backend:', apiPayload);

      const response = await createOrderApi(apiPayload);

      if (!response.success) {
        throw new Error(response.message || 'Tạo đơn hàng thất bại');
      }

      // ✅ Update currentOrder with backend response data
      if (response.data) {
        setCurrentOrder({
          ...order,
          createdAt: new Date(),
          status: 'pending',
        });
      }

      // Handle different payment methods
      switch (paymentMethod) {
        case 'MOMO':
          // Redirect to MoMo payment gateway
          console.log('Redirecting to MoMo payment...');
          setSuccessMessage('Chuyển hướng đến MoMo...');
          
          try {
            const orderId = response.data?._id;
            if (!orderId) throw new Error('Không tìm thấy ID đơn hàng từ hệ thống');

            console.log('🔗 Fetching MoMo URL for order:', orderId);

            const momoResponse = await apiPost('/api/momo/create_payment', {
              orderId: orderId,
              amount: Number(calculateTotal()),
              orderInfo: 'Thanh toán đơn hàng MyBeauty ' + orderId,
            });

            if (!momoResponse.ok) {
              const errorData = await momoResponse.json();
              throw new Error(errorData.message || 'Lỗi từ phía máy chủ thanh toán MoMo');
            }

            const momoData = await momoResponse.json();

            if (momoData.success && momoData.payUrl) {
              console.log('🚀 Redirecting to MoMo:', momoData.payUrl);
              clearCart();
              window.location.href = momoData.payUrl;
            } else {
              throw new Error(momoData.message || 'Không nhận được đường dẫn thanh toán từ MoMo');
            }
          } catch (momoError: any) {
            console.error('❌ MoMo redirect error:', momoError);
            setErrorMessage(`Lỗi MoMo: ${momoError.message || 'Đã có lỗi xảy ra'}`);
            setIsLoading(false);
            setOrderLoading(false);
          }
          break;
        case 'VNPAY':
          // Redirect to VNPay payment gateway
          console.log('Redirecting to VNPay payment...');
          setSuccessMessage('Chuyển hướng đến VNPay...');
          
          try {
            // Get order ID from the created response
            const orderId = response.data?._id;
            if (!orderId) throw new Error('Không tìm thấy ID đơn hàng từ hệ thống');

            console.log('🔗 Fetching VNPAY URL for order:', orderId);

            // Call internal API to get VNPay URL using centralized apiClient
            const vnpayResponse = await apiPost('/api/vnpay/create_payment_url', {
              orderId: orderId,
              amount: Number(calculateTotal()),
              bankCode: '',
            });

            if (!vnpayResponse.ok) {
              const errorData = await vnpayResponse.json();
              throw new Error(errorData.message || 'Lỗi từ phía máy chủ thanh toán');
            }

            const vnpayData = await vnpayResponse.json();

            if (vnpayData.success && vnpayData.paymentUrl) {
              console.log('🚀 Redirecting to VNPAY:', vnpayData.paymentUrl);
              // Clear cart before redirecting
              clearCart();
              // Redirect to VNPay
              window.location.href = vnpayData.paymentUrl;
            } else {
              throw new Error(vnpayData.message || 'Không nhận được đường dẫn thanh toán từ VNPAY');
            }
          } catch (vnpError: any) {
             console.error('❌ VNPay redirect error:', vnpError);
             setErrorMessage(`Lỗi VNPAY: ${vnpError.message || 'Đã có lỗi xảy ra'}`);
             // Reset loading state to let user try again or choose another method
             setIsLoading(false);
             setOrderLoading(false);
          }
          break;
        default:
          // COD - order processing
          setSuccessMessage('Đặt hàng thành công! Chuyển hướng...');
          
          // Clear cart and redirect to order success page
          clearCart();
          setTimeout(() => {
            router.push('/order-success');
          }, 1000);
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckout();
                }}
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
