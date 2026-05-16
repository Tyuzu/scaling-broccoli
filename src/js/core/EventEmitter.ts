/**
 * Simple event emitter for loose coupling between modules.
 * Decouples components from implementation details.
 */

export type EventHandler<T = any> = (data: T) => void;
export type EventUnsubscribe = () => void;

export class EventEmitter {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, handler: EventHandler<T>): EventUnsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to an event only once
   */
  once<T = any>(event: string, handler: EventHandler<T>): EventUnsubscribe {
    const unsubscribe = this.on(event, (data: T) => {
      handler(data);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * Emit an event
   */
  emit<T = any>(event: string, data?: T): void {
    const handlers = this.listeners.get(event);

    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in event handler for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  off(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Global event emitter instance
export const eventBus = new EventEmitter();

// Event types for better TypeScript support
export const Events = {
  LANGUAGE_CHANGED: 'language:changed',
  NAVIGATION: 'navigation:changed',
  ERROR: 'error:occurred',
  ROUTE_LOADING: 'route:loading',
  ROUTE_LOADED: 'route:loaded',
  ROUTE_ERROR: 'route:error',
  // E-commerce events
  CART_ITEM_ADDED: 'cart:item:added',
  CART_ITEM_REMOVED: 'cart:item:removed',
  CART_CLEARED: 'cart:cleared',
  CART_UPDATED: 'cart:updated',
  CHECKOUT_STARTED: 'checkout:started',
  CHECKOUT_COMPLETED: 'checkout:completed',
  CHECKOUT_FAILED: 'checkout:failed',
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_PROCESSED: 'payment:processed',
  PAYMENT_FAILED: 'payment:failed'
} as const;
