/**
 * Application bootstrapping and service initialization
 * Centralizes all dependency injection configuration
 * 
 * This file should be imported early in the app lifecycle
 * to set up all services before the app starts.
 */

import { serviceRegistry, ServiceKeys } from './core/ServiceRegistry';
import { ConsoleLogger, type ILogger } from './core/Logger';
import { DefaultErrorHandler, type IErrorHandler } from './core/ErrorHandler';
import { ApiService, type IApiService } from './services/ApiService';
import { createUserService, type IUserService } from './services/user';
import { initializeEcommerce } from './components/composed/ecommerceIntegration';

/**
 * Initialize all application services
 * Register them in the service registry for loose coupling
 */
export function initializeServices(): void {
  // Register logger
  const logger: ILogger = new ConsoleLogger();
  serviceRegistry.register<ILogger>(ServiceKeys.LOGGER, logger);

  // Register error handler
  const errorHandler: IErrorHandler = new DefaultErrorHandler(logger);
  serviceRegistry.register<IErrorHandler>(ServiceKeys.ERROR_HANDLER, errorHandler);

  // Register API service
  const apiService: IApiService = new ApiService(errorHandler);
  serviceRegistry.register<IApiService>(ServiceKeys.API, apiService);

  // Register user service (requires API service)
  const userService: IUserService = createUserService(apiService, errorHandler);
  serviceRegistry.register<IUserService>(ServiceKeys.USER_SERVICE, userService);

  // Initialize e-commerce services
  initializeEcommerce(serviceRegistry);
}

/**
 * Retrieve a service from the registry
 * Example: const api = getService<IApiService>(ServiceKeys.API);
 */
export function getService<T>(key: string): T {
  return serviceRegistry.get<T>(key);
}
