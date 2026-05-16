# Project Architecture Guide

## Overview

This project has been refactored to follow a **modular, loosely-coupled architecture**. The main goal is to reduce dependencies between modules and make the codebase more maintainable and testable.

## Core Principles

### 1. **Event-Driven Communication (EventBus)**
Instead of direct imports and function calls, modules communicate via events.

**Benefits:**
- Decouples modules - they don't need to know about each other
- Easy to add logging, monitoring, or middleware
- Simple to debug and trace application flow

**Example:**
```typescript
// Before: Direct import and call
import { setState } from '../state/state';
setState({ language: 'es' });

// After: Emit event
eventBus.emit(Events.LANGUAGE_CHANGED, { language: 'es' });
```

### 2. **Dependency Injection (ServiceRegistry)**
Services are registered in a central registry instead of being scattered throughout the code.

**Benefits:**
- Easy to swap implementations (e.g., MockLogger for testing)
- All dependencies are explicit and visible
- Centralized configuration

**Example:**
```typescript
// In bootstrap.ts - all DI setup in one place
initializeServices();

// In components - get services from registry
const api = getService<IApiService>(ServiceKeys.API);
```

### 3. **Interface-Based Design**
Services are defined by interfaces, not implementations.

**Benefits:**
- Multiple implementations can exist
- Easy to mock for testing
- Clear contracts between modules

**Example:**
```typescript
export interface IApiService {
  fetch<T>(url: string, options?: RequestInit): Promise<T>;
}

// Can have MockApiService, CachedApiService, etc.
export class ApiService implements IApiService { ... }
```

### 4. **Centralized Configuration**
Routes, constants, and configuration are separated from logic.

**Benefits:**
- Easy to manage and extend
- Single source of truth
- Configuration changes don't require code changes

**Example:**
```typescript
// src/js/config/routes.ts
export const routes: Route[] = [
  { path: '/', name: 'home', loader: () => import('../pages/home.ts') },
  { path: '/about', name: 'about', loader: () => import('../pages/about.ts') },
];
```

## Project Structure

```
src/
├── main.ts                 # Entry point - bootstraps the app
├── js/
│   ├── bootstrap.ts        # Service initialization (DI)
│   ├── core/
│   │   ├── EventEmitter.ts # Event-based communication
│   │   ├── ServiceRegistry.ts # Dependency injection
│   │   ├── Logger.ts       # Logger interface
│   │   ├── ErrorHandler.ts # Error handling
│   │   └── index.ts        # Barrel exports
│   ├── config/
│   │   ├── routes.ts       # Route definitions
│   │   └── index.ts        # Barrel exports
│   ├── services/
│   │   ├── BaseService.ts  # Base service class
│   │   ├── ApiService.ts   # HTTP client service
│   │   ├── user.ts         # User API service
│   │   └── index.ts        # Barrel exports
│   ├── routes/
│   │   └── router.ts       # Router logic (no route definitions)
│   ├── pages/
│   │   ├── home.ts
│   │   ├── about.ts
│   │   └── user.ts
│   ├── components/
│   │   ├── base/           # Atomic components
│   │   ├── composed/       # Composite components
│   │   └── utils/          # Utilities (createElement, etc.)
│   ├── i18n/
│   │   ├── i18n.ts         # Translation logic
│   │   └── locales/        # JSON translation files
│   ├── state/
│   │   └── state.ts        # Global state management
│   ├── api/
│   │   └── api.ts          # Deprecated - use ApiService instead
│   └── utils/
```

## How to Use

### Adding a New Service

1. **Create the service interface**
   ```typescript
   // src/js/services/payment.ts
   export interface IPaymentService {
     process(amount: number): Promise<void>;
   }
   ```

2. **Implement the service**
   ```typescript
   export class PaymentService extends BaseService implements IPaymentService {
     constructor(private api: IApiService, errorHandler: IErrorHandler) {
       super(errorHandler);
     }

     async process(amount: number): Promise<void> {
       return this.api.fetch('/api/payment', {
         method: 'POST',
         body: { amount }
       });
     }
   }
   ```

3. **Register in bootstrap.ts**
   ```typescript
   export function initializeServices(): void {
     // ... existing services ...
     
     const paymentService = new PaymentService(apiService, errorHandler);
     serviceRegistry.register(ServiceKeys.PAYMENT, paymentService);
   }
   ```

### Adding a New Route

1. **Add to config/routes.ts**
   ```typescript
   export const routes: Route[] = [
     // ... existing routes ...
     {
       path: '/products',
       name: 'products',
       loader: () => import('../pages/products.ts')
     }
   ];
   ```

2. **Create the page module**
   ```typescript
   // src/js/pages/products.ts
   import { t } from '../i18n/i18n';

   export function render() {
     return `<h1>${t('products')}</h1>`;
   }
   ```

### Listening to Events

```typescript
import { eventBus, Events } from './js/core/EventEmitter';

// Subscribe to language changes
eventBus.on(Events.LANGUAGE_CHANGED, (data) => {
  console.log('Language changed to:', data.language);
  // Update UI, refresh data, etc.
});

// Subscribe to route changes
eventBus.on(Events.ROUTE_LOADED, (data) => {
  console.log('Loaded route:', data.route);
});

// Unsubscribe when needed
const unsubscribe = eventBus.on(Events.LANGUAGE_CHANGED, handler);
unsubscribe(); // Clean up
```

### Using Services

```typescript
import { getService, ServiceKeys } from './js/bootstrap';
import type { IUserService } from './js/services/user';

// Get the service from registry
const userService = getService<IUserService>(ServiceKeys.USER_SERVICE);

// Use it
const user = await userService.getUser('123');
```

## Benefits of This Architecture

✅ **Modularity** - Each module has a single responsibility
✅ **Testability** - Easy to mock services and test in isolation
✅ **Maintainability** - Changes are localized, less ripple effects
✅ **Extensibility** - Add features without modifying existing code
✅ **Scalability** - Clear structure makes it easy to add new modules
✅ **Readability** - Clear contracts and explicit dependencies
✅ **Debugging** - Event emitter logs all important state changes

## Migration Guide

### Old Way (Tightly Coupled)
```typescript
import { setState } from '../state/state';
import { apiFetch } from '../api/api';
import { t } from '../i18n/i18n';

// All imports are concrete implementations
// Changes to one affect others
```

### New Way (Loosely Coupled)
```typescript
import { getService, ServiceKeys } from '../bootstrap';
import { eventBus, Events } from '../core/EventEmitter';

// Depend on interfaces, not implementations
const userService = getService<IUserService>(ServiceKeys.USER_SERVICE);

// Use events for communication
eventBus.emit(Events.LANGUAGE_CHANGED, { language: 'es' });
```

## Next Steps

1. **Update components** to use the service registry
2. **Add middleware system** to router for authentication, logging
3. **Create store management** for complex state needs
4. **Add error boundary** component for graceful error handling
5. **Unit tests** for services using mocked dependencies
