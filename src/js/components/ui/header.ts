/**
 * Header Component with Cart Integration
 * Features: SPA navigation, cart button, responsive design
 */

import { createCartButton, updateCartBadge } from '../composed/cartButton';
import { eventBus, Events } from '../../core/EventEmitter';

export interface HeaderConfig {
  title?: string;
  onCartClick?: () => void;
  onNavigate?: (path: string) => void;
}

export function createHeader(config: HeaderConfig = {}): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'main-header';

  header.innerHTML = `
    <div class="header-container">
      <div class="header-brand">
        <h1 class="site-title">${config.title || 'Vitex Shop'}</h1>
      </div>
      <nav class="header-nav">
        <ul class="nav-links">
          <li><a href="/" class="nav-link" data-route="/">Home</a></li>
          <li><a href="/products" class="nav-link" data-route="/products">Products</a></li>
          <li><a href="/about" class="nav-link" data-route="/about">About</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <div id="cart-container"></div>
      </div>
    </div>
  `;

  // Add cart button
  const cartContainer = header.querySelector('#cart-container');
  if (cartContainer) {
    const cartButton = createCartButton(config.onCartClick);
    cartContainer.appendChild(cartButton);
  }

  // SPA navigation links
  const navLinks = header.querySelectorAll('[data-route]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = (link as HTMLElement).getAttribute('data-route');
      if (route && config.onNavigate) {
        config.onNavigate(route);
      }
      // Emit navigation event for other listeners
      eventBus.emit(Events.NAVIGATION, { path: route });
    });
  });

  return header;
}

/**
 * Update header cart badge count
 */
export function updateHeaderCartBadge(count: number): void {
  updateCartBadge(count);
}
