/**
 * Service Registry for dependency injection.
 * Provides loose coupling by allowing modules to depend on abstractions
 * rather than concrete implementations.
 */

export class ServiceRegistry {
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  /**
   * Register a singleton service
   */
  register<T>(key: string, value: T): void {
    this.services.set(key, value);
  }

  /**
   * Register a factory function for lazy initialization
   */
  registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Get a service (creates via factory if needed)
   */
  get<T = any>(key: string): T {
    // Check singleton cache first
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Try factory
    if (this.factories.has(key)) {
      const instance = this.factories.get(key)!();
      // Cache the result
      this.services.set(key, instance);
      return instance as T;
    }

    throw new Error(`Service not found: ${key}`);
  }

  /**
   * Check if service exists
   */
  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// Global service registry
export const serviceRegistry = new ServiceRegistry();

// Service keys for type-safe access
export const ServiceKeys = {
  LOGGER: 'logger',
  ERROR_HANDLER: 'errorHandler',
  I18N: 'i18n',
  STATE: 'state',
  ROUTER: 'router',
  API: 'api',
  USER_SERVICE: 'userService'
} as const;
