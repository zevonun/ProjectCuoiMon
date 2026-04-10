// app/orders/lib/orderApi.ts
import { apiFetch } from '../../lib/apiClient';

export interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  notes?: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  customerInfo: OrderCustomerInfo;
  products: OrderProduct[];
  totalPrice: number;
  shippingFee: number;
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returning' | 'returned';
  notes?: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Helper: lấy token từ localStorage
function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ GET /api/orders - Lấy danh sách đơn hàng (có filter theo status)
export async function getOrders(
  userId: string,
  status?: string
): Promise<Order[]> {
  try {
    const query = new URLSearchParams({ userId });
    if (status && status !== 'all') {
      query.append('status', status);
    }

    const response = await apiFetch(`/api/orders?${query}`, {
      method: 'GET',
    });

    const data: ApiResponse<Order[]> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy đơn hàng');
    }

    return data.data || [];
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    throw error;
  }
}

// ✅ GET /api/orders/:id - Lấy chi tiết đơn hàng
export async function getOrderDetails(orderId: string): Promise<Order> {
  try {
    const response = await apiFetch(`/api/orders/${orderId}`, {
      method: 'GET',
    });

    const data: ApiResponse<Order> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }

    return data.data as Order;
  } catch (error) {
    console.error('❌ Error getting order details:', error);
    throw error;
  }
}

// ✅ PATCH /api/orders/:id/cancel - Hủy đơn hàng
export async function cancelOrder(orderId: string): Promise<Order> {
  try {
    const response = await apiFetch(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });

    const data: ApiResponse<Order> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi hủy đơn hàng');
    }

    return data.data as Order;
  } catch (error) {
    console.error('❌ Error canceling order:', error);
    throw error;
  }
}

// ✅ PATCH /api/orders/:id/address - Cập nhật địa chỉ
export async function updateOrderAddress(
  orderId: string,
  address: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
  }
): Promise<Order> {
  try {
    const response = await apiFetch(`/api/orders/${orderId}/address`, {
      method: 'PATCH',
      body: JSON.stringify(address),
    });

    const data: ApiResponse<Order> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật địa chỉ');
    }

    return data.data as Order;
  } catch (error) {
    console.error('❌ Error updating address:', error);
    throw error;
  }
}
