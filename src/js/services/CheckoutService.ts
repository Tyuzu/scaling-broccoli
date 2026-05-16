/**
 * CheckoutService - Manages checkout flow
 * Handles order creation and checkout process
 */

import { BaseService } from './BaseService';
import { eventBus, Events } from '../core/EventEmitter';
import type { IErrorHandler } from '../core/ErrorHandler';
import type { Cart } from './CartService';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  timestamp: number;
  cart: Cart;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export class CheckoutService extends BaseService {
  name = 'CheckoutService';
  private currentOrder: Order | null = null;

  constructor(errorHandler: IErrorHandler) {
    super(errorHandler);
  }

  /**
   * Start checkout with cart and shipping address
   */
  startCheckout(cart: Cart, shippingAddress: ShippingAddress): Order | null {
    try {
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!this.validateAddress(shippingAddress)) {
        throw new Error('Invalid shipping address');
      }

      this.currentOrder = {
        id: this.generateOrderId(),
        timestamp: Date.now(),
        cart: { ...cart },
        shippingAddress: { ...shippingAddress },
        status: 'pending'
      };

      eventBus.emit(Events.CHECKOUT_STARTED, { order: this.currentOrder });
      return this.currentOrder;
    } catch (error) {
      this.handleError(error as Error, 'startCheckout');
      eventBus.emit(Events.CHECKOUT_FAILED, { error });
      return null;
    }
  }

  /**
   * Complete checkout (after payment)
   */
  completeCheckout(): boolean {
    try {
      if (!this.currentOrder) {
        throw new Error('No active order');
      }

      this.currentOrder.status = 'completed';
      const completedOrder = { ...this.currentOrder };
      this.currentOrder = null;

      eventBus.emit(Events.CHECKOUT_COMPLETED, { order: completedOrder });
      return true;
    } catch (error) {
      this.handleError(error as Error, 'completeCheckout');
      eventBus.emit(Events.CHECKOUT_FAILED, { error });
      return false;
    }
  }

  /**
   * Cancel checkout
   */
  cancelCheckout(): void {
    try {
      if (this.currentOrder) {
        this.currentOrder.status = 'cancelled';
      }
      this.currentOrder = null;
    } catch (error) {
      this.handleError(error as Error, 'cancelCheckout');
    }
  }

  /**
   * Get current order
   */
  getCurrentOrder(): Order | null {
    return this.currentOrder ? { ...this.currentOrder } : null;
  }

  /**
   * Private: Validate shipping address
   */
  private validateAddress(address: ShippingAddress): boolean {
    return !!(
      address.firstName &&
      address.lastName &&
      address.email &&
      address.street &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.country
    );
  }

  /**
   * Private: Generate unique order ID
   */
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
