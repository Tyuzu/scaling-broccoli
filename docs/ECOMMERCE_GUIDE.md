# E-Commerce Functionality Guide

## Overview

This guide explains how to use the new e-commerce features added to the Vitex project. The implementation is event-driven and fully integrated with the existing service architecture.

## Features Added

### 1. Cart Management
- **CartService**: Manages shopping cart operations
  - Add items to cart
  - Remove items from cart
  - Update item quantities
  - Calculate totals (subtotal, tax, total)
  - Clear entire cart

### 2. Checkout System
- **CheckoutService**: Handles checkout workflow
  - Start checkout with cart and shipping address
  - Validate shipping addresses
  - Generate order IDs
  - Complete checkout process
  - Cancel checkouts

### 3. Payment Processing
- **PaymentService**: Manages payment operations
  - Process payments
  - Track payment status
  - Mock implementation (easily integrable with Stripe, PayPal, etc.)

### 4. UI Components
- **CartButton**: Header cart icon with badge count
- **CartModal**: Full cart display with item management
- **CheckoutForm**: Multi-step shipping address form
- **PaymentForm**: Credit card payment form
- **ProductCard**: Product display with add-to-cart button
- **Header**: Enhanced header with cart button and SPA navigation
- **Nav**: Main navigation with active link tracking

### 5. Event System
New e-commerce events have been added:
- `CART_ITEM_ADDED`
- `CART_ITEM_REMOVED`
- `CART_CLEARED`
- `CART_UPDATED`
- `CHECKOUT_STARTED`
- `CHECKOUT_COMPLETED`
- `CHECKOUT_FAILED`
- `PAYMENT_INITIATED`
- `PAYMENT_PROCESSED`
- `PAYMENT_FAILED`

### 6. State Management
Extended application state includes:
- `cart`: Current shopping cart object
- `currentOrder`: Active order information
- `isCheckingOut`: Checkout in progress flag

## Installation & Setup

### 1. Update Your Bootstrap/Main File

```typescript
import { initializeEcommerce } from './js/components/composed/ecommerceIntegration';
import { ServiceRegistry } from './js/core/ServiceRegistry';

// In your initialization code:
const serviceRegistry = new ServiceRegistry();
// ... set up other services ...

// Initialize e-commerce functionality
initializeEcommerce(serviceRegistry);
```

### 2. Update Your HTML

Include the new CSS files in your `index.html`:

```html
<link rel="stylesheet" href="/src/css/ecommerce.css">
<link rel="stylesheet" href="/src/css/navigation.css">
<link rel="stylesheet" href="/src/css/products.css">
```

### 3. Import Components in Your Main Page

```typescript
import { createHeader } from './js/components/ui/header';
import { createNav } from './js/components/ui/nav';

// Create header with cart
const header = createHeader({
  title: 'Vitex Shop',
  onCartClick: () => showCart(),
  onNavigate: (path) => router.navigate(path)
});

// Create navigation
const nav = createNav({
  onNavigate: (path) => router.navigate(path)
});

document.body.insertBefore(header, document.body.firstChild);
document.body.insertBefore(nav, header.nextSibling);
```

## Usage Examples

### Example 1: Add Product to Cart

```typescript
import { ServiceRegistry } from './js/core/ServiceRegistry';
import { CartService } from './js/services/CartService';
import { createProductCard } from './js/components/composed/productCard';

const serviceRegistry = new ServiceRegistry();
const cartService = serviceRegistry.get('CART_SERVICE') as CartService;

// Create a product
const product = {
  id: 'prod-1',
  name: 'Lavender Fragrance',
  price: 29.99,
  description: 'Premium lavender scent',
  image: '/images/lavender.jpg',
  sku: 'LAV-001'
};

// Create product card
const productCard = createProductCard(product, {
  onAddToCart: (item) => {
    cartService.addItem(item);
    console.log('Added to cart!');
  }
});

// Add to DOM
document.querySelector('.products-grid').appendChild(productCard);
```

### Example 2: Show Cart Modal

```typescript
import { showCartModal } from './js/components/composed/ecommerceIntegration';
import { CartService } from './js/services/CartService';
import { CheckoutService } from './js/services/CheckoutService';

const cartService = serviceRegistry.get('CART_SERVICE') as CartService;
const checkoutService = serviceRegistry.get('CHECKOUT_SERVICE') as CheckoutService;

showCartModal(cartService, () => {
  // Handle checkout click
  const cart = cartService.getCart();
  // Show checkout form...
});
```

### Example 3: Complete Checkout Flow

```typescript
import { showCheckoutForm, showPaymentForm } from './js/components/composed/ecommerceIntegration';
import { CartService } from './js/services/CartService';
import { CheckoutService } from './js/services/CheckoutService';
import { PaymentService } from './js/services/PaymentService';

const cartService = serviceRegistry.get('CART_SERVICE') as CartService;
const checkoutService = serviceRegistry.get('CHECKOUT_SERVICE') as CheckoutService;
const paymentService = serviceRegistry.get('PAYMENT_SERVICE') as PaymentService;

// Step 1: Show checkout form
showCheckoutForm(
  cartService.getCart(),
  async (shippingAddress) => {
    // Step 2: Start checkout with address
    const order = checkoutService.startCheckout(
      cartService.getCart(),
      shippingAddress
    );

    if (order) {
      // Step 3: Show payment form
      showPaymentForm(
        order.cart.total,
        order.id,
        async (paymentMethod) => {
          // Step 4: Process payment
          const result = await paymentService.processPayment({
            orderId: order.id,
            amount: order.cart.total,
            currency: 'USD',
            method: paymentMethod
          });

          if (result.success) {
            // Step 5: Complete checkout
            checkoutService.completeCheckout();
            cartService.clearCart();
            alert('Order placed successfully!');
          } else {
            alert(`Payment failed: ${result.error}`);
          }
        },
        () => console.log('Payment cancelled')
      );
    }
  },
  () => console.log('Checkout cancelled')
);
```

### Example 4: Listen to Cart Events

```typescript
import { eventBus, Events } from './js/core/EventEmitter';

// Listen to cart updates
eventBus.on(Events.CART_UPDATED, (cart) => {
  console.log('Cart updated:', cart);
  console.log(`Items: ${cart.itemCount}, Total: $${cart.total}`);
});

// Listen to item additions
eventBus.on(Events.CART_ITEM_ADDED, (data) => {
  console.log('Item added:', data.item.name);
});

// Listen to checkout completion
eventBus.on(Events.CHECKOUT_COMPLETED, (data) => {
  console.log('Order placed:', data.order.id);
});

// Listen to payment events
eventBus.on(Events.PAYMENT_PROCESSED, (data) => {
  console.log('Payment successful:', data.result.transactionId);
});
```

### Example 5: Create Products Grid

```typescript
import { createProductCard } from './js/components/composed/productCard';
import { CartService } from './js/services/CartService';

const cartService = serviceRegistry.get('CART_SERVICE') as CartService;

const products = [
  {
    id: 'prod-1',
    name: 'Rose Perfume',
    price: 34.99,
    description: 'Elegant rose fragrance',
    image: '/images/rose.jpg'
  },
  {
    id: 'prod-2',
    name: 'Ocean Breeze',
    price: 24.99,
    description: 'Fresh ocean scent',
    image: '/images/ocean.jpg'
  },
  // ... more products
];

const grid = document.createElement('div');
grid.className = 'products-grid';

products.forEach((product) => {
  const card = createProductCard(product, {
    onAddToCart: (item) => cartService.addItem(item)
  });
  grid.appendChild(card);
});

document.body.appendChild(grid);
```

## Integration with Payment Providers

### Stripe Integration

```typescript
// In PaymentService, replace the processPayment mock with:
async processPayment(details: PaymentDetails): Promise<PaymentResult> {
  try {
    eventBus.emit(Events.PAYMENT_INITIATED, { orderId: details.orderId });

    const stripe = window.Stripe('your-publishable-key');
    const result = await stripe.confirmCardPayment('client-secret', {
      payment_method: {
        card: cardElement,
        billing_details: { name: details.method.holderName }
      }
    });

    if (result.paymentIntent.status === 'succeeded') {
      return {
        success: true,
        transactionId: result.paymentIntent.id,
        timestamp: Date.now()
      };
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    // ... handle error
  }
}
```

## Event Flow Diagram

```
1. User clicks "Add to Cart" on product
   ↓
2. CartService.addItem() called
   ↓
3. CART_ITEM_ADDED event emitted
   ↓
4. CART_UPDATED event emitted
   ↓
5. UI updates (badge count, cart modal)
   ↓
6. User proceeds to checkout
   ↓
7. CheckoutService.startCheckout() called
   ↓
8. CHECKOUT_STARTED event emitted
   ↓
9. PaymentForm shown
   ↓
10. PaymentService.processPayment() called
    ↓
11. PAYMENT_INITIATED event emitted
    ↓
12. Payment processed (API call simulated/real)
    ↓
13. PAYMENT_PROCESSED or PAYMENT_FAILED event emitted
    ↓
14. If successful: CheckoutService.completeCheckout()
    ↓
15. CHECKOUT_COMPLETED event emitted
    ↓
16. CartService.clearCart()
    ↓
17. Order complete!
```

## State Management

### Cart State Structure

```typescript
{
  cart: {
    items: [
      {
        id: "prod-1",
        name: "Product Name",
        price: 29.99,
        quantity: 2,
        image: "url",
        sku: "SKU-001"
      }
    ],
    subtotal: 59.98,
    tax: 5.998,
    total: 65.98,
    itemCount: 2
  },
  isCheckingOut: false,
  currentOrder: null
}
```

## Error Handling

All services use the centralized ErrorHandler from the service registry:

```typescript
// Errors are automatically logged
// Service methods emit ERROR events:
eventBus.on(Events.ERROR, (error) => {
  console.error('E-commerce error:', error);
  // Show user-friendly error message
});
```

## CSS Classes Reference

### Cart
- `.cart-button` - Cart icon button
- `.cart-badge` - Item count badge
- `.cart-modal` - Modal container
- `.cart-item` - Individual cart item
- `.checkout-btn` - Checkout button

### Forms
- `.checkout-form` - Checkout form container
- `.payment-form` - Payment form container
- `.form-section` - Form section grouping
- `.form-group` - Individual form field

### Products
- `.product-card` - Product card container
- `.product-image` - Product image
- `.add-to-cart-btn` - Add to cart button
- `.products-grid` - Products grid layout

### Navigation
- `.site-header` - Header container
- `.header-nav` - Navigation in header
- `.nav-link` - Navigation link
- `.nav-link.active` - Active navigation link

## TypeScript Interfaces

### CartItem
```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  timestamp: number;
  cart: Cart;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}
```

### PaymentResult
```typescript
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: number;
}
```

## Best Practices

1. **Always initialize e-commerce** in your bootstrap/main file
2. **Listen to events** instead of directly calling service methods
3. **Handle errors** by listening to ERROR and PAYMENT_FAILED events
4. **Validate data** before showing forms (addresses, card numbers)
5. **Use TypeScript** types for type safety
6. **Cache cart data** in localStorage for persistence (optional)
7. **Show loading states** during payment processing
8. **Clear cart** after successful checkout
9. **Track user journey** with event emissions for analytics
10. **Test** payment flow in development before going to production

## Next Steps

1. Add localStorage persistence for cart
2. Integrate with a real payment provider (Stripe, PayPal)
3. Add order history page
4. Add discount/coupon code functionality
5. Add shipping method selection
6. Add user reviews and ratings
7. Add product filters and search
8. Add wishlist functionality

---

For more information, see the Architecture guide and other documentation files.
