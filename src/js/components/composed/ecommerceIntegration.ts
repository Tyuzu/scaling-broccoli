/**
 * E-Commerce Integration Example
 * Shows how to use Cart, Checkout, Payment services together
 */

import { ServiceRegistry } from '../../core/ServiceRegistry';
import { eventBus, Events } from '../../core/EventEmitter';
import { CartService } from '../../services/CartService';
import { CheckoutService } from '../../services/CheckoutService';
import { PaymentService } from '../../services/PaymentService';
import { createCartModal } from './cartModal';
import { createCheckoutForm } from './checkoutForm';
import { createPaymentForm } from './paymentForm';
import { updateHeaderCartBadge } from '../ui/header';

/**
 * Initialize e-commerce functionality
 * Call this in your bootstrap/main initialization
 */
export function initializeEcommerce(serviceRegistry: ServiceRegistry): void {
  // Get or create services
  if (!serviceRegistry.has('CART_SERVICE')) {
    const errorHandler = serviceRegistry.get('ERROR_HANDLER');
    const cartService = new CartService(errorHandler);
    serviceRegistry.register('CART_SERVICE', cartService);
  }

  if (!serviceRegistry.has('CHECKOUT_SERVICE')) {
    const errorHandler = serviceRegistry.get('ERROR_HANDLER');
    const checkoutService = new CheckoutService(errorHandler);
    serviceRegistry.register('CHECKOUT_SERVICE', checkoutService);
  }

  if (!serviceRegistry.has('PAYMENT_SERVICE')) {
    const errorHandler = serviceRegistry.get('ERROR_HANDLER');
    const paymentService = new PaymentService(errorHandler);
    serviceRegistry.register('PAYMENT_SERVICE', paymentService);
  }

  // Setup event listeners
  setupCartEventListeners();
  setupCheckoutEventListeners();
  setupPaymentEventListeners();
}

/**
 * Setup cart event listeners
 */
function setupCartEventListeners(): void {
  // Listen to cart updates
  eventBus.on(Events.CART_UPDATED, (cart) => {
    updateHeaderCartBadge(cart.itemCount);
    console.log('Cart updated:', cart);
  });

  eventBus.on(Events.CART_ITEM_ADDED, (data) => {
    console.log('Item added to cart:', data.item);
  });

  eventBus.on(Events.CART_ITEM_REMOVED, (data) => {
    console.log('Item removed from cart:', data.itemId);
  });

  eventBus.on(Events.CART_CLEARED, () => {
    console.log('Cart cleared');
    updateHeaderCartBadge(0);
  });
}

/**
 * Setup checkout event listeners
 */
function setupCheckoutEventListeners(): void {
  eventBus.on(Events.CHECKOUT_STARTED, (data) => {
    console.log('Checkout started:', data.order);
  });

  eventBus.on(Events.CHECKOUT_COMPLETED, (data) => {
    console.log('Order completed:', data.order);
    // Clear cart after successful checkout
    const cartService = new CartService(null as any);
    cartService.clearCart();
  });

  eventBus.on(Events.CHECKOUT_FAILED, (data) => {
    console.error('Checkout failed:', data.error);
  });
}

/**
 * Setup payment event listeners
 */
function setupPaymentEventListeners(): void {
  eventBus.on(Events.PAYMENT_INITIATED, (data) => {
    console.log('Payment processing started for order:', data.orderId);
  });

  eventBus.on(Events.PAYMENT_PROCESSED, (data) => {
    console.log('Payment successful:', data.result);
  });

  eventBus.on(Events.PAYMENT_FAILED, (data) => {
    console.error('Payment failed:', data.error);
  });
}

/**
 * Show cart modal
 */
export function showCartModal(
  cartService: CartService,
  onCheckout: () => void
): void {
  const cart = cartService.getCart();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create modal
  const modal = createCartModal(cart, {
    onRemoveItem: (itemId) => {
      cartService.removeItem(itemId);
      // Refresh modal
      modal.remove();
      overlay.remove();
      showCartModal(cartService, onCheckout);
    },
    onUpdateQuantity: (itemId, quantity) => {
      cartService.updateQuantity(itemId, quantity);
      // Refresh modal
      modal.remove();
      overlay.remove();
      showCartModal(cartService, onCheckout);
    },
    onCheckout,
    onClose: () => {
      modal.remove();
      overlay.remove();
    }
  });

  // Add to page
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Close on overlay click
  overlay.addEventListener('click', () => {
    modal.remove();
    overlay.remove();
  });
}

/**
 * Show checkout form
 */
export function showCheckoutForm(
  onSubmit: (address: any) => void,
  onCancel: () => void
): void {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create form
  const form = createCheckoutForm({
    onSubmit,
    onCancel: () => {
      form.remove();
      overlay.remove();
      onCancel();
    }
  });

  // Wrap in container
  const container = document.createElement('div');
  container.className = 'checkout-modal';
  container.appendChild(form);

  // Add to page
  document.body.appendChild(overlay);
  document.body.appendChild(container);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      container.remove();
      overlay.remove();
      onCancel();
    }
  });
}

/**
 * Show payment form
 */
export function showPaymentForm(
  amount: number,
  orderId: string,
  onSubmit: (method: any) => Promise<void>,
  onCancel: () => void
): void {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create form
  const form = createPaymentForm({
    amount,
    orderId,
    onSubmit: async (method) => {
      // Disable form while processing
      const submitBtn = form.querySelector('.submit-btn') as HTMLButtonElement;
      const cancelBtn = form.querySelector('.cancel-btn') as HTMLButtonElement;

      if (submitBtn && cancelBtn) {
        submitBtn.disabled = true;
        cancelBtn.disabled = true;
      }

      try {
        await onSubmit(method);
        form.remove();
        overlay.remove();
      } catch (error) {
        console.error('Payment submission error:', error);
      } finally {
        if (submitBtn && cancelBtn) {
          submitBtn.disabled = false;
          cancelBtn.disabled = false;
        }
      }
    },
    onCancel: () => {
      form.remove();
      overlay.remove();
      onCancel();
    }
  });

  // Wrap in container
  const container = document.createElement('div');
  container.className = 'payment-modal';
  container.appendChild(form);

  // Add to page
  document.body.appendChild(overlay);
  document.body.appendChild(container);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      container.remove();
      overlay.remove();
      onCancel();
    }
  });
}
