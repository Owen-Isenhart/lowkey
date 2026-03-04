"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { CartService } from "@/lib/cartService";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider manages shopping cart state with localStorage persistence.
 * Hydrates on mount to prevent SSR/CSR mismatches.
 * 
 * This separation allows:
 * - Server components don't manage cart state
 * - Client components use useCart() for reactive updates
 * - localStorage persists across sessions
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const cartItems = CartService.getCart();
    setItems(cartItems);
    setIsLoading(false);
  }, []);

  const addItem = (product: Product, quantity: number = 1) => {
    const updated = CartService.addItem(product, quantity);
    setItems(updated);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const updated = CartService.updateQuantity(productId, quantity);
    setItems(updated);
  };

  const removeItem = (productId: number) => {
    const updated = CartService.removeItem(productId);
    setItems(updated);
  };

  const clearCart = () => {
    CartService.clearCart();
    setItems([]);
  };

  const getTotal = () => CartService.getTotal(items);
  const getItemCount = () => CartService.getItemCount(items);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook for consuming cart context in client components.
 * Ensures component is wrapped with CartProvider.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
