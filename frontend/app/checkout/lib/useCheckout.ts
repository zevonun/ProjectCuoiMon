// app/checkout/lib/useCheckout.ts
'use client';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { CartItem } from '../types';

export interface CheckoutData {
  cartProducts: CartItem[];
  totalItems: number;
  subtotal: number;
}

export const useCheckout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, customerInfo, updateCustomerInfo } = useAuth();
  const { createOrder, isLoading, setIsLoading } = useOrder();

  // Chuyển đổi CartContext items sang Checkout format
  const getCheckoutData = (): CheckoutData => {
    const cartProducts = cartItems.map(item => ({
      id: item.product._id,
      name: item.product.ten_sp,
      price: item.product.gia_km && item.product.gia_km < item.product.gia 
        ? item.product.gia_km 
        : item.product.gia,
      quantity: item.quantity,
      image: item.product.hinh || '/img/placeholder.png',
    }));

    return {
      cartProducts,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: totalPrice,
    };
  };

  const handleCheckout = async (
    paymentMethod: 'COD' | 'MOMO' | 'VNPAY'
  ) => {
    if (!customerInfo || !user) {
      throw new Error('Thông tin khách hàng hoặc người dùng không được tìm thấy');
    }

    const SHIPPING_FEE = 30000;
    const checkoutData = getCheckoutData();

    const order = {
      customerInfo,
      products: checkoutData.cartProducts,
      paymentMethod,
      totalPrice: checkoutData.subtotal + SHIPPING_FEE,
      totalProducts: checkoutData.totalItems,
      shippingFee: SHIPPING_FEE,
    };

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Order:', order);

      // Save order to context
      createOrder(order);

      // TODO: Send to backend API
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(order),
      // });
      // const data = await response.json();

      // Handle payment methods
      switch (paymentMethod) {
        case 'MOMO':
          console.log('Redirecting to MoMo payment...');
          // window.location.href = `${process.env.NEXT_PUBLIC_MOMO_GATEWAY}`;
          break;
        case 'VNPAY':
          console.log('Redirecting to VNPay payment...');
          // window.location.href = `${process.env.NEXT_PUBLIC_VNPAY_GATEWAY}`;
          break;
        default: // COD
          clearCart();
          return { success: true, message: 'Đặt hàng thành công!' };
      }

      return { success: true };
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCheckoutData,
    handleCheckout,
    user,
    customerInfo,
    updateCustomerInfo,
    isLoading,
    setIsLoading,
  };
};
