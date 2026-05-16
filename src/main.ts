/**
 * Application entry point
 * Initializes all core services and starts the application
 */

import { initializeServices } from './js/bootstrap';
import { initRouter } from './js/routes/router';
import { initI18n } from './js/i18n/i18n';
import { eventBus, Events } from './js/core/EventEmitter';

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