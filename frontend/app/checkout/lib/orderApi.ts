// app/checkout/lib/orderApi.ts
import { apiFetch } from '../../lib/apiClient';

export interface CreateOrderPayload {
  userId: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    notes?: string;
  };
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY';
  totalPrice: number;
  shippingFee: number;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    userId: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  try {
    const token = localStorage.getItem('access_token');
    
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    console.log('🔑 Full token check:', {
      exists: !!token,
      length: token?.length,
      starts_with_eyJ: token?.startsWith('eyJ'),
    });
    
    if (!token) {
      throw new Error('Bạn cần đăng nhập để tạo đơn hàng');
    }

    if (!token.startsWith('eyJ')) {
      console.warn('⚠️ Token format suspicious - not starting with eyJ');
    }
    
    const response = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.error || JSON.stringify(data) || 'Lỗi khi tạo đơn hàng';
      console.error('❌ Backend error response:', { status: response.status, data, payload });
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

export async function getOrders(userId: string): Promise<any[]> {
  try {
    const response = await apiFetch(`/api/orders?userId=${userId}`, {
      method: 'GET',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy đơn hàng');
    }

    return data.data || [];
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderDetails(orderId: string): Promise<any> {
  try {
    const response = await apiFetch(`/api/orders/${orderId}`, {
      method: 'GET',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    throw error;
  }
}
