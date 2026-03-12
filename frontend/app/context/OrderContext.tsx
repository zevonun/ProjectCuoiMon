"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Order {
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    notes?: string;
  };
  products: Array<{
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY';
  totalPrice: number;
  totalProducts: number;
  shippingFee: number;
  createdAt?: Date;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (order: Order) => void;
  setCurrentOrder: (order: Order | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function useOrder(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used inside OrderProvider');
  }
  return context;
}

interface OrderProviderProps {
  children: ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = (order: Order) => {
    try {
      setIsLoading(true);
      const newOrder: Order = {
        ...order,
        createdAt: new Date(),
        status: 'pending',
      };
      setOrders(prev => [...prev, newOrder]);
      setCurrentOrder(newOrder);
      setError(null);
      console.log('✅ Order created:', newOrder);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      console.error('❌ Error creating order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearOrders = () => {
    setOrders([]);
    setCurrentOrder(null);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        isLoading,
        error,
        createOrder,
        setCurrentOrder,
        setIsLoading,
        setError,
        clearOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
