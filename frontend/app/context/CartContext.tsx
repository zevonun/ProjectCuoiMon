"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { Product } from "../lib/api";

// CartItem có đầy đủ thông tin sản phẩm + số lượng
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  selectedItems: Set<string>;
  toggleSelectItem: (productId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  selectedPrice: number;
  selectedCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ĐÃ SỬA ĐÚNG: dùng product._id
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems(new Set());
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(cartItems.map(item => item.product._id)));
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Tính giá sản phẩm (dùng giá khuyến mãi nếu có)
  const getItemPrice = (product: Product) => {
    return (product.gia_km && product.gia_km < product.gia) ? product.gia_km : product.gia;
  };

  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + getItemPrice(item.product) * item.quantity, 0),
    [cartItems]
  );

  const selectedPrice = useMemo(
    () => cartItems
      .filter(item => selectedItems.has(item.product._id))
      .reduce((acc, item) => acc + getItemPrice(item.product) * item.quantity, 0),
    [cartItems, selectedItems]
  );

  const selectedCount = useMemo(
    () => cartItems
      .filter(item => selectedItems.has(item.product._id))
      .reduce((acc, item) => acc + item.quantity, 0),
    [cartItems, selectedItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
        selectedItems,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        selectedPrice,
        selectedCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};