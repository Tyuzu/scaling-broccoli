/**
 * Cart Modal Component
 * Displays shopping cart items with checkout button
 */

import type { Cart } from '../../services/CartService';

export interface CartModalConfig {
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onCheckout?: () => void;
  onClose?: () => void;
}

export function createCartModal(
  cart: Cart,
  config: CartModalConfig = {}
): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'cart-modal';
  modal.id = 'cart-modal';

  const isEmpty = cart.items.length === 0;

  modal.innerHTML = `
    <div class="cart-modal-content">
      <div class="cart-modal-header">
        <h2>Shopping Cart</h2>
        <button class="close-btn" aria-label="Close cart">&times;</button>
      </div>

      <div class="cart-modal-body">
        ${isEmpty ? '<p class="empty-cart">Your cart is empty</p>' : ''}
        <div class="cart-items-list">
          ${cart.items
            .map(
              item => `
            <div class="cart-item" data-item-id="${item.id}">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">` : ''}
              <div class="cart-item-details">
                <h4>${item.name}</h4>
                ${item.sku ? `<p class="sku">SKU: ${item.sku}</p>` : ''}
                <p class="price">$${item.price.toFixed(2)}</p>
              </div>
              <div class="cart-item-quantity">
                <input type="number" min="1" value="${item.quantity}" class="qty-input" aria-label="Quantity">
              </div>
              <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
              </div>
              <button class="remove-btn" aria-label="Remove item" data-item-id="${item.id}">&times;</button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="cart-modal-footer">
        <div class="cart-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${cart.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>$${cart.tax.toFixed(2)}</span>
          </div>
          <div class="total-row total">
            <span>Total:</span>
            <span>$${cart.total.toFixed(2)}</span>
          </div>
        </div>
        <button class="checkout-btn" ${isEmpty ? 'disabled' : ''}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  `;

  // Event listeners
  const closeBtn = modal.querySelector('.close-btn');
  if (closeBtn && config.onClose) {
    closeBtn.addEventListener('click', config.onClose);
  }

  const removeButtons = modal.querySelectorAll('.remove-btn');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = (e.target as HTMLElement).getAttribute('data-item-id');
      if (itemId && config.onRemoveItem) {
        config.onRemoveItem(itemId);
      }
    });
  });

  const qtyInputs = modal.querySelectorAll('.qty-input');
  qtyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const itemId = (e.target as HTMLElement).closest('.cart-item')?.getAttribute('data-item-id');
      const quantity = parseInt((e.target as HTMLInputElement).value, 10);
      if (itemId && config.onUpdateQuantity && quantity > 0) {
        config.onUpdateQuantity(itemId, quantity);
      }
    });
  });

  const checkoutBtn = modal.querySelector('.checkout-btn');
  if (checkoutBtn && config.onCheckout && !isEmpty) {
    checkoutBtn.addEventListener('click', config.onCheckout);
  }

  return modal;
}
