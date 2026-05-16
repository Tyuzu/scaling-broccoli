/**
 * Checkout Form Component
 * Multi-step checkout form for shipping and billing
 */

import type { ShippingAddress } from '../../services/CheckoutService';

export interface CheckoutFormConfig {
  onSubmit?: (address: ShippingAddress) => void;
  onCancel?: () => void;
}

export function createCheckoutForm(config: CheckoutFormConfig = {}): HTMLElement {
  const form = document.createElement('form');
  form.className = 'checkout-form';
  form.id = 'checkout-form';
  form.noValidate = true;

  form.innerHTML = `
    <div class="checkout-container">
      <h2>Checkout</h2>

      <div class="form-section">
        <h3>Shipping Address</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name *</label>
            <input type="text" id="firstName" name="firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name *</label>
            <input type="text" id="lastName" name="lastName" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="street">Street Address *</label>
            <input type="text" id="street" name="street" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">City *</label>
            <input type="text" id="city" name="city" required>
          </div>
          <div class="form-group">
            <label for="state">State *</label>
            <input type="text" id="state" name="state" required>
          </div>
          <div class="form-group">
            <label for="postalCode">Postal Code *</label>
            <input type="text" id="postalCode" name="postalCode" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="country">Country *</label>
            <input type="text" id="country" name="country" required>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">Continue to Payment</button>
        <button type="button" class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const address: ShippingAddress = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string
    };

    if (config.onSubmit) {
      config.onSubmit(address);
    }
  });

  // Cancel button
  const cancelBtn = form.querySelector('.cancel-btn');
  if (cancelBtn && config.onCancel) {
    cancelBtn.addEventListener('click', config.onCancel);
  }

  return form;
}
