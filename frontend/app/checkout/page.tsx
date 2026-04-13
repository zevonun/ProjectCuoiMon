'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from './components/CustomerForm';
import { ProductList } from './components/ProductList';
import { OrderSummary } from './components/OrderSummary';
import { VoucherPicker } from './components/VoucherPicker';
import { PaymentMethod } from './components/PaymentMethod';
import {
  CartItem,
  CustomerInfo,
  PaymentMethod as PaymentMethodType,
  Order,
} from './types';
import { validateCustomerInfo } from './lib/validation';
import { createOrder as createOrderApi } from './lib/orderApi';
import { applyVoucherToOrder, validateVoucher, VoucherValidationResult, getAvailableVouchers } from './lib/voucherApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { apiPost } from '../lib/apiClient';
import styles from './checkout.module.css';

const SHIPPING_FEE = 30000;

interface Voucher {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  minOrderAmount?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, selectedItems } = useCart();
  const { user, customerInfo: authCustomerInfo, updateCustomerInfo, isLoggedIn } = useAuth();
  const { createOrder, setIsLoading: setOrderLoading, isLoading: orderLoading, setCurrentOrder } = useOrder();

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
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidationResult | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  useEffect(() => {
    const checkoutCart = cartItems
      .filter((item) => selectedItems.has(item.product._id))
      .map((item) => ({
        id: item.product._id,
        name: item.product.ten_sp,
        price:
          item.product.gia_km && item.product.gia_km < item.product.gia
            ? item.product.gia_km
            : item.product.gia,
        quantity: item.quantity,
        image: item.product.hinh || '/img/placeholder.png',
      }));

    setCart(checkoutCart);
  }, [cartItems, selectedItems]);

  useEffect(() => {
    setAppliedVoucher(null);
    setVoucherError('');
    setVoucherSuccess('');
    // Fetch available vouchers
    const fetchVouchers = async () => {
      setVouchersLoading(true);
      try {
        const vouchers = await getAvailableVouchers();
        setAvailableVouchers(vouchers);
      } catch (error) {
        console.error('Failed to fetch vouchers:', error);
        setAvailableVouchers([]);
      } finally {
        setVouchersLoading(false);
      }
    };
    fetchVouchers();
  }, [cart]);

  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
    updateCustomerInfo(info);
    if (errorMessage) setErrorMessage('');
  };

  const calculateSubtotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateDiscount = (): number => {
    return appliedVoucher?.discount || 0;
  };

  const calculateTotal = (): number => {
    return Math.max(0, calculateSubtotal() - calculateDiscount()) + SHIPPING_FEE;
  };

  const handleApplyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    const subtotal = calculateSubtotal();

    if (!code) {
      setVoucherError('Vui long nhap ma voucher');
      setVoucherSuccess('');
      return;
    }

    if (subtotal <= 0) {
      setVoucherError('Khong co san pham hop le de ap voucher');
      setVoucherSuccess('');
      return;
    }

    setVoucherLoading(true);
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const result = await validateVoucher(code, subtotal);
      setAppliedVoucher(result);
      setVoucherInput(result.voucher.code);
      setVoucherSuccess('Da ap dung voucher ' + result.voucher.code);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(error instanceof Error ? error.message : 'Áp dụng voucher thất bại');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
    setVoucherSuccess('');
  };

  const handleSelectVoucher = async (voucher: Voucher) => {
    setVoucherInput(voucher.code);
    setVoucherLoading(true);
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const result = await validateVoucher(voucher.code, calculateSubtotal());
      setAppliedVoucher(result);
      setVoucherSuccess('✓ Đã áp dụng mã ' + result.voucher.code);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(error instanceof Error ? error.message : 'Áp dụng voucher thất bại');
    } finally {
      setVoucherLoading(false);
    }
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
    const validationErrors = validateCustomerInfo(customerInfo);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage('Vui Lòng điền đầy đủ thông tin khách hàng hợp lệ');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Giỏ hàng trống');
      return;
    }

    if (!isLoggedIn || !user) {
      setErrorMessage('Vui lòng đăng nhập để tiếp tục thanh toán');
      return;
    }

    const order: Order = {
      customerInfo,
      products: cart,
      paymentMethod,
      totalPrice: calculateTotal(),
      totalProducts: cart.reduce((total, item) => total + item.quantity, 0),
      shippingFee: SHIPPING_FEE,
      discount: calculateDiscount(),
      voucherCode: appliedVoucher?.voucher.code,
    };

    setOrderLoading(true);
    setIsLoading(true);

    try {
      createOrder(order);

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
        products: cart.map((item) => ({
          productId: String(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        paymentMethod,
        totalPrice: Number(calculateTotal()),
        shippingFee: Number(SHIPPING_FEE),
        notes: appliedVoucher?.voucher.code
          ? 'Voucher: ' + appliedVoucher.voucher.code + ' | Giam: ' + calculateDiscount()
          : undefined,
      };

      const response = await createOrderApi(apiPayload);

      if (!response.success) {
        throw new Error(response.message || 'Tạo đơn hàng thất bại');
      }

      if (response.data) {
        if (appliedVoucher?.voucher.code) {
          try {
            await applyVoucherToOrder(appliedVoucher.voucher.code, response.data._id);
          } catch (voucherApplyError) {
            console.error('Voucher apply tracking error:', voucherApplyError);
          }
        }

        setCurrentOrder({
          ...order,
          createdAt: new Date(),
          status: 'pending',
        });
      }

      switch (paymentMethod) {
        case 'MOMO': {
          setSuccessMessage('Chuyển hướng đến MoMo...');
          const orderId = response.data?._id;
          if (!orderId) throw new Error('Khong tim thay ID don hang');

          const momoResponse = await apiPost('/api/momo/create_payment', {
            orderId,
            amount: Number(calculateTotal()),
            orderInfo: 'Thanh toan don hang MyBeauty ' + orderId,
          });

          if (!momoResponse.ok) {
            const errorData = await momoResponse.json();
            throw new Error(errorData.message || 'Loi MoMo');
          }

          const momoData = await momoResponse.json();
          if (!momoData.success || !momoData.payUrl) {
            throw new Error(momoData.message || 'Khong nhan duoc duong dan thanh toan MoMo');
          }

          clearCart();
          window.location.href = momoData.payUrl;
          break;
        }
        case 'VNPAY': {
          setSuccessMessage('Chuyen huong den VNPay...');
          const orderId = response.data?._id;
          if (!orderId) throw new Error('Khong tim thay ID don hang');

          const vnpayResponse = await apiPost('/api/vnpay/create_payment_url', {
            orderId,
            amount: Number(calculateTotal()),
            bankCode: '',
          });

          if (!vnpayResponse.ok) {
            const errorData = await vnpayResponse.json();
            throw new Error(errorData.message || 'Loi VNPAY');
          }

          const vnpayData = await vnpayResponse.json();
          if (!vnpayData.success || !vnpayData.paymentUrl) {
            throw new Error(vnpayData.message || 'Khong nhan duoc duong dan thanh toan VNPAY');
          }

          clearCart();
          window.location.href = vnpayData.paymentUrl;
          break;
        }
        default:
          setSuccessMessage('Đặt hàng thành công! Chuyển hướng...');
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
        <div className={styles.header}>
          <h1 className={styles.title}>Thanh toán</h1>
          <p className={styles.subtitle}>Hoàn tất đơn hàng của bạn</p>
        </div>

        {successMessage && (
          <div className={styles.successAlert}>
            <span>x</span>
            <div>
              <p className={styles.alertTitle}>Thanh toán thành công!</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorAlert}>
            <span>!</span>
            <div>
              <p className={styles.alertTitle}>Lỗi!</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <div className={styles.checkoutWrapper}>
          <div className={styles.mainContent}>
            <CustomerForm onCustomerInfoChange={handleCustomerInfoChange} />
            <ProductList products={cart} />
            
            {/* Voucher Picker */}
            <VoucherPicker
              availableVouchers={availableVouchers}
              selectedVoucher={appliedVoucher?.voucher}
              onSelectVoucher={handleSelectVoucher}
              subtotal={calculateSubtotal()}
              loading={voucherLoading}
              error={voucherError}
              success={voucherSuccess}
            />
            
            <OrderSummary
              products={cart}
              voucherCode={appliedVoucher?.voucher.code}
              voucherDiscount={calculateDiscount()}
            />
            <PaymentMethod
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            <div className={styles.checkoutButtonContainer}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckout();
                }}
                disabled={isLoading || cart.length === 0}
                className={`${styles.checkoutButton} ${isLoading ? styles.loading : ''}`}
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
