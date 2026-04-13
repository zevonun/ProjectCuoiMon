// Types for Checkout
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  notes: string;
}

export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY';

export interface Order {
  customerInfo: CustomerInfo;
  products: CartItem[];
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalProducts: number;
  shippingFee: number;
  discount?: number;
  voucherCode?: string;
}

export interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  paymentMethod?: string;
}
