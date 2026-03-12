// app/checkout/lib/orderApi.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tạo đơn hàng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

export async function getOrders(userId: string): Promise<any[]> {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_URL}/api/orders?userId=${userId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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
