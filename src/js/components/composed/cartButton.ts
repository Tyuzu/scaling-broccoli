/**
 * CartButton Component
 * Displays cart icon with item count badge
 */

export function createCartButton(onClickCallback?: () => void): HTMLElement {
  const cartButton = document.createElement('button');
  cartButton.className = 'cart-button';
  cartButton.setAttribute('aria-label', 'Shopping cart');
  cartButton.id = 'cart-btn';

  cartButton.innerHTML = `
    <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span class="cart-badge" id="cart-count">0</span>
  `;

  if (onClickCallback) {
    cartButton.addEventListener('click', onClickCallback);
  }

  return cartButton;
}

/**
 * Update cart badge count
 */
export function updateCartBadge(count: number): void {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count.toString();
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}
