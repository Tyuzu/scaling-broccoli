/**
 * Product Card Component
 * Displays product with add-to-cart functionality
 */

import type { CartItem } from '../../services/CartService';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  sku?: string;
}

export interface ProductCardConfig {
  onAddToCart?: (item: CartItem) => void;
}

export function createProductCard(
  product: Product,
  config: ProductCardConfig = {}
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.id = `product-${product.id}`;

  card.innerHTML = `
    <div class="product-image-wrapper">
      ${
        product.image
          ? `<img src="${product.image}" alt="${product.name}" class="product-image">`
          : '<div class="product-image-placeholder">No Image</div>'
      }
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      ${product.sku ? `<p class="product-sku">SKU: ${product.sku}</p>` : ''}
      ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
      <div class="product-footer">
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <button class="add-to-cart-btn" aria-label="Add to cart">
          Add to Cart
        </button>
      </div>
    </div>
  `;

  // Add to cart button handler
  const addBtn = card.querySelector('.add-to-cart-btn') as HTMLButtonElement;
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (config.onAddToCart) {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        sku: product.sku
      };
      config.onAddToCart(cartItem);

      // Visual feedback
      addBtn.textContent = '✓ Added!';
      setTimeout(() => {
        addBtn.textContent = 'Add to Cart';
      }, 2000);
      }
    });
  }

  return card;
}
