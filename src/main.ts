/**
 * Application entry point
 * Initializes all core services and starts the application
 */

// Import styles
import './css/ecommerce.css';
import './css/navigation.css';
import './css/products.css';

import { initializeServices } from './js/bootstrap';
import { initRouter } from './js/routes/router';
import { initI18n } from './js/i18n/i18n';
import { eventBus, Events } from './js/core/EventEmitter';
import { createHeader } from './js/components/ui/header';
import { createNav } from './js/components/ui/nav';
import { showCartModal } from './js/components/composed/ecommerceIntegration';
import { serviceRegistry, ServiceKeys } from './js/core/ServiceRegistry';
import type { CartService } from './js/services/CartService';

/**
 * Initialize and boot the application
 */
async function bootstrap() {
  try {
    // Initialize all services (dependency injection setup)
    initializeServices();

    // Initialize i18n
    await initI18n();

    // Listen for navigation events (optional logging)
    eventBus.on(Events.ROUTE_LOADING, (data) => {
      console.debug('🔄 Loading route:', data.route || data.path);
    });

    eventBus.on(Events.ROUTE_LOADED, (data) => {
      console.debug('✅ Route loaded:', data.route || data.path);
    });

    eventBus.on(Events.ROUTE_ERROR, (data) => {
      console.error('❌ Route error:', data.error, 'at', data.path);
    });

    eventBus.on(Events.LANGUAGE_CHANGED, (data) => {
      console.debug('🌍 Language changed:', data.language);
    });

    // Create and mount header with cart button
    const header = createHeader({
      title: 'Vitex Shop',
      onCartClick: () => {
        const cartService = serviceRegistry.get<CartService>(ServiceKeys.CART_SERVICE);
        showCartModal(cartService, () => {
          // Handle checkout click
          console.log('Proceeding to checkout...');
          // Checkout logic will be handled by the user
        });
      },
      onNavigate: (path) => {
        console.log('Navigating to:', path);
        eventBus.emit(Events.NAVIGATION, { path });
      }
    });

    // Create and mount navigation
    const nav = createNav({
      onNavigate: (path) => {
        console.log('Navigating to:', path);
        eventBus.emit(Events.NAVIGATION, { path });
      }
    });

    // Prepend header and nav to document
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    // Initialize router
    initRouter('#app');
  } catch (err) {
    console.error('Failed to bootstrap application:', err);
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = '<h1>Failed to load application</h1>';
    }
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}