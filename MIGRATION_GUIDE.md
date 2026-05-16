# Migration Guide: Using the New Modular Architecture

## Quick Start

### 1. Accessing Services

```typescript
import { getService, ServiceKeys } from './js/bootstrap';
import type { IUserService } from './js/services/user';

// Get a service
const userService = getService<IUserService>(ServiceKeys.USER_SERVICE);

// Use it
const user = await userService.getUser('123');
```

### 2. Listening to Events

```typescript
import { eventBus, Events } from './js/core/EventEmitter';

// Listen to language changes
eventBus.on(Events.LANGUAGE_CHANGED, ({ language }) => {
  console.log('Language changed to:', language);
});

// Listen to navigation
eventBus.on(Events.ROUTE_LOADED, ({ route, path }) => {
  console.log('Navigated to:', path);
});

// Unsubscribe when done
const unsubscribe = eventBus.on(Events.LANGUAGE_CHANGED, handler);
unsubscribe();
```

### 3. Adding a New Service

```typescript
// 1. Define interface
export interface IAnalyticsService {
  trackEvent(name: string, data?: any): void;
}

// 2. Implement service
import { BaseService } from './BaseService';

export class AnalyticsService extends BaseService implements IAnalyticsService {
  name = 'AnalyticsService';

  trackEvent(name: string, data?: any): void {
    console.log(`[Analytics] ${name}`, data);
  }
}

// 3. Register in bootstrap.ts
import { AnalyticsService } from './services/analytics';

export function initializeServices(): void {
  // ... existing services ...
  
  const analytics = new AnalyticsService(errorHandler);
  serviceRegistry.register(ServiceKeys.ANALYTICS, analytics);
}

// 4. Add to ServiceKeys
export const ServiceKeys = {
  // ... existing ...
  ANALYTICS: 'analytics'
} as const;
```

### 4. Adding a New Route

```typescript
// Edit src/js/config/routes.ts
export const routes: Route[] = [
  { path: '/', name: 'home', loader: () => import('../pages/home.ts') },
  // Add your new route
  { path: '/products', name: 'products', loader: () => import('../pages/products.ts') },
];

// Create src/js/pages/products.ts
import { t } from '../i18n/i18n';

export function render() {
  return `<h1>${t('products')}</h1>`;
}
```

## Common Patterns

### Pattern 1: Using Multiple Services

```typescript
import { getService, ServiceKeys } from './bootstrap';

async function loadUserData(userId: string) {
  const userService = getService(ServiceKeys.USER_SERVICE);
  const logger = getService(ServiceKeys.LOGGER);

  logger.info(`Loading user ${userId}`);
  
  try {
    const user = await userService.getUser(userId);
    logger.info(`User loaded: ${user.name}`);
    return user;
  } catch (err) {
    logger.error('Failed to load user', err);
    throw err;
  }
}
```

### Pattern 2: Event-Driven Updates

```typescript
import { eventBus, Events } from './core/EventEmitter';
import { t } from './i18n/i18n';

// Listen to language changes and update UI
eventBus.on(Events.LANGUAGE_CHANGED, ({ language }) => {
  // Refresh all translations
  const app = document.querySelector('#app');
  if (app) {
    app.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (key) el.textContent = t(key);
    });
  }
});
```

### Pattern 3: Creating a Service That Uses Other Services

```typescript
import { BaseService } from './BaseService';
import type { IApiService } from './ApiService';
import type { IErrorHandler } from '../core/ErrorHandler';

export interface INotificationService {
  send(message: string): Promise<void>;
}

export class NotificationService extends BaseService implements INotificationService {
  name = 'NotificationService';

  constructor(
    private api: IApiService,
    private logger: ILogger,
    errorHandler: IErrorHandler
  ) {
    super(errorHandler);
  }

  async send(message: string): Promise<void> {
    this.logger.info('Sending notification:', message);
    
    try {
      await this.api.fetch('/api/notifications', {
        method: 'POST',
        body: { message }
      });
      this.logger.info('Notification sent');
    } catch (err) {
      this.handleError(
        err instanceof Error ? err : new Error(String(err)),
        'NotificationService.send'
      );
      throw err;
    }
  }
}

// Register in bootstrap.ts
export function initializeServices(): void {
  // ... existing ...
  const logger = serviceRegistry.get<ILogger>(ServiceKeys.LOGGER);
  const notifications = new NotificationService(apiService, logger, errorHandler);
  serviceRegistry.register(ServiceKeys.NOTIFICATIONS, notifications);
}
```

### Pattern 4: Error Handling

```typescript
// Old way (no longer recommended)
try {
  const data = await fetch('/api/data');
} catch (err) {
  console.error(err); // Inconsistent error handling
}

// New way (using centralized error handler)
import { getService, ServiceKeys } from './bootstrap';

const errorHandler = getService(ServiceKeys.ERROR_HANDLER);

try {
  const api = getService(ServiceKeys.API);
  const data = await api.fetch('/api/data');
} catch (err) {
  errorHandler.handle(
    err instanceof Error ? err : new Error(String(err)),
    'DataLoader'
  );
}
```

### Pattern 5: Emitting Custom Events

```typescript
import { eventBus } from './core/EventEmitter';

// In your component or page
function handleUserLogin(user: User) {
  // Emit a custom event
  eventBus.emit('user:logged-in', { user });
}

// Listen somewhere else
eventBus.on('user:logged-in', ({ user }) => {
  console.log('User logged in:', user.name);
});
```

## Type-Safe Service Access

For better TypeScript support, create a helper:

```typescript
// src/js/core/useService.ts
import { getService, ServiceKeys } from '../bootstrap';

export function useLogger() {
  return getService(ServiceKeys.LOGGER);
}

export function useApi() {
  return getService(ServiceKeys.API);
}

export function useUserService() {
  return getService(ServiceKeys.USER_SERVICE);
}

// Usage - cleaner and type-safe
import { useUserService } from './core/useService';

async function loadUser(id: string) {
  const userService = useUserService();
  return userService.getUser(id);
}
```

## Debugging

### View All Events

```typescript
import { eventBus } from './core/EventEmitter';

// Intercept all events (in development)
const originalEmit = eventBus.emit.bind(eventBus);
eventBus.emit = function(event: string, data?: any) {
  console.log(`📤 Event: ${event}`, data);
  return originalEmit(event, data);
};
```

### Check Registered Services

```typescript
import { serviceRegistry } from './core/ServiceRegistry';

// Not directly exposed, but you can check
console.log('Services registered'); // Services are now set up
```

### Monitor API Calls

```typescript
import { eventBus, Events } from './core/EventEmitter';

eventBus.on(Events.ROUTE_LOADING, ({ path, route }) => {
  console.debug(`Loading ${route || path}...`);
});

eventBus.on(Events.ROUTE_LOADED, ({ path, route }) => {
  console.debug(`✅ ${route || path} loaded`);
});

eventBus.on(Events.ROUTE_ERROR, ({ path, error }) => {
  console.debug(`❌ ${path} failed: ${error}`);
});
```

## Testing

### Test a Service with Mocks

```typescript
import { UserService } from './services/user';
import { MockApiService } from './services/__mocks__/ApiService';
import { MockErrorHandler } from './core/__mocks__/ErrorHandler';

describe('UserService', () => {
  it('should fetch user data', async () => {
    const mockApi = new MockApiService();
    mockApi.mockResolvedValue({ id: '1', name: 'John' });

    const service = new UserService(mockApi, new MockErrorHandler());
    const user = await service.getUser('1');

    expect(user.name).toBe('John');
  });
});
```

## Troubleshooting

### "Service not found" Error

```
Error: Service not found: ServiceKeys.MY_SERVICE
```

**Solution:** Make sure you:
1. Added the service to `initializeServices()` in bootstrap.ts
2. Added the service key to `ServiceKeys`
3. Called `initializeServices()` before using the service

### Events Not Firing

```typescript
// Make sure you're using the correct event name
eventBus.on(Events.LANGUAGE_CHANGED, handler); // ✅ Correct
eventBus.on('languageChanged', handler);       // ❌ Won't work
```

### TypeScript "not assignable to type" Error

```typescript
// Make sure you import the interface
import type { IUserService } from './services/user';
const userService = getService<IUserService>(ServiceKeys.USER_SERVICE); // ✅
```

## Summary

The new architecture is:
- **Simpler to understand** - Clear separation of concerns
- **Easier to maintain** - Changes are localized
- **Better to test** - Services are mockable
- **More scalable** - Add features without modifying existing code
- **Type-safe** - Full TypeScript support

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
