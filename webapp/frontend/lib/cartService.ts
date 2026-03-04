import { CartItem, Product } from "@/types";

/**
 * CartService handles localStorage persistence for the shopping cart.
 * Provides atomic operations for cart manipulation.
 * 
 * Security considerations:
 * - No sensitive data stored (prices validated on checkout)
 * - Cart is client-side only, validated on backend before payment
 * - Prevents tampering by recalculating from product API on checkout
 */
export class CartService {
  private static readonly STORAGE_KEY = "lowkey_cart";
  private static readonly MAX_QUANTITY = 99;
  private static readonly MIN_QUANTITY = 1;

  /**
   * Get all cart items from localStorage
   */
  static getCart(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  }

  /**
   * Set entire cart (used for clearing or bulk operations)
   */
  static setCart(items: CartItem[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }

  /**
   * Add product to cart or increment quantity if already present
   */
  static addItem(product: Product, quantity: number = 1): CartItem[] {
    const validatedQuantity = this.validateQuantity(quantity);
    const cart = this.getCart();
    
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      // Product already in cart - increment quantity
      const newQuantity = cart[existingIndex].quantity + validatedQuantity;
      cart[existingIndex].quantity = Math.min(newQuantity, this.MAX_QUANTITY);
    } else {
      // New product - add to cart
      cart.push({ product, quantity: validatedQuantity });
    }

    this.setCart(cart);
    return cart;
  }

  /**
   * Update quantity of a specific cart item
   */
  static updateQuantity(productId: number, quantity: number): CartItem[] {
    const validatedQuantity = this.validateQuantity(quantity);
    const cart = this.getCart();
    
    const item = cart.find((item) => item.product.id === productId);
    if (item) {
      item.quantity = validatedQuantity;
      this.setCart(cart);
    }

    return cart;
  }

  /**
   * Remove item from cart
   */
  static removeItem(productId: number): CartItem[] {
    const cart = this.getCart().filter((item) => item.product.id !== productId);
    this.setCart(cart);
    return cart;
  }

  /**
   * Clear entire cart
   */
  static clearCart(): void {
    this.setCart([]);
  }

  /**
   * Get total price in cents
   */
  static getTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.product.price_cents * item.quantity, 0);
  }

  /**
   * Get item count
   */
  static getItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Validate and sanitize quantity
   */
  private static validateQuantity(quantity: number): number {
    const parsed = Math.floor(quantity);
    return Math.max(this.MIN_QUANTITY, Math.min(parsed, this.MAX_QUANTITY));
  }
}
