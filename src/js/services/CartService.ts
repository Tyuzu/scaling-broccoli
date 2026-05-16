/**
 * CartService - Manages shopping cart operations
 * Event-driven cart management with state synchronization
 */

import { BaseService } from './BaseService';
import { eventBus, Events } from '../core/EventEmitter';
import type { IErrorHandler } from '../core/ErrorHandler';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export class CartService extends BaseService {
  name = 'CartService';
  private cart: Cart = this.initializeCart();

  constructor(errorHandler: IErrorHandler) {
    super(errorHandler);
  }

  /**
   * Initialize empty cart
   */
  private initializeCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0
    };
  }

  /**
   * Get current cart
   */
  getCart(): Readonly<Cart> {
    return Object.freeze({ ...this.cart });
  }

  /**
   * Add item to cart
   */
  addItem(item: Omit<CartItem, 'quantity'> | CartItem): void {
    try {
      const cartItem = item as CartItem;
      if (!cartItem.quantity) cartItem.quantity = 1;

      const existingItem = this.cart.items.find(i => i.id === cartItem.id);

      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        this.cart.items.push({ ...cartItem });
      }

      this.updateTotals();
      eventBus.emit(Events.CART_ITEM_ADDED, { item: cartItem, cart: this.getCart() });
      eventBus.emit(Events.CART_UPDATED, this.getCart());
    } catch (error) {
      this.handleError(error as Error, 'addItem');
      eventBus.emit(Events.ERROR, { message: 'Failed to add item to cart', error });
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): void {
    try {
      const index = this.cart.items.findIndex(i => i.id === itemId);

      if (index !== -1) {
        this.cart.items.splice(index, 1);
        this.updateTotals();
        eventBus.emit(Events.CART_ITEM_REMOVED, { itemId, cart: this.getCart() });
        eventBus.emit(Events.CART_UPDATED, this.getCart());
      }
    } catch (error) {
      this.handleError(error as Error, 'removeItem');
      eventBus.emit(Events.ERROR, { message: 'Failed to remove item from cart', error });
    }
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): void {
    try {
      if (quantity <= 0) {
        this.removeItem(itemId);
        return;
      }

      const item = this.cart.items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        this.updateTotals();
        eventBus.emit(Events.CART_UPDATED, this.getCart());
      }
    } catch (error) {
      this.handleError(error as Error, 'updateQuantity');
      eventBus.emit(Events.ERROR, { message: 'Failed to update quantity', error });
    }
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    try {
      this.cart = this.initializeCart();
      eventBus.emit(Events.CART_CLEARED, null);
      eventBus.emit(Events.CART_UPDATED, this.getCart());
    } catch (error) {
      this.handleError(error as Error, 'clearCart');
      eventBus.emit(Events.ERROR, { message: 'Failed to clear cart', error });
    }
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.cart.itemCount;
  }

  /**
   * Private: Calculate totals (subtotal, tax, total)
   */
  private updateTotals(): void {
    const subtotal = this.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const tax = subtotal * 0.1; // 10% tax - adjust as needed
    const total = subtotal + tax;
    const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.cart.subtotal = Math.round(subtotal * 100) / 100;
    this.cart.tax = Math.round(tax * 100) / 100;
    this.cart.total = Math.round(total * 100) / 100;
    this.cart.itemCount = itemCount;
  }

  /**
   * Validate cart has items
   */
  isCartValid(): boolean {
    return this.cart.items.length > 0;
  }
}
