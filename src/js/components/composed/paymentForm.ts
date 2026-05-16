/**
 * Payment Form Component
 * Credit card payment form with processing feedback
 */

import type { PaymentMethod } from '../../services/PaymentService';

export interface PaymentFormConfig {
  amount: number;
  orderId: string;
  isProcessing?: boolean;
  onSubmit?: (method: PaymentMethod) => void;
  onCancel?: () => void;
}

export function createPaymentForm(config: PaymentFormConfig): HTMLElement {
  const form = document.createElement('form');
  form.className = 'payment-form';
  form.id = 'payment-form';
  form.noValidate = true;

  form.innerHTML = `
    <div class="payment-container">
      <h2>Payment Information</h2>

      <div class="payment-amount">
        <p>Amount to pay: <strong>$${config.amount.toFixed(2)}</strong></p>
      </div>

      <div class="form-section">
        <h3>Payment Method</h3>

        <div class="payment-methods">
          <label class="method-option">
            <input type="radio" name="paymentType" value="credit_card" checked>
            <span>Credit Card</span>
          </label>
          <label class="method-option">
            <input type="radio" name="paymentType" value="paypal">
            <span>PayPal</span>
          </label>
          <label class="method-option">
            <input type="radio" name="paymentType" value="debit_card">
            <span>Debit Card</span>
          </label>
        </div>
      </div>

      <div id="cardDetails" class="form-section">
        <div class="form-row">
          <div class="form-group full-width">
            <label for="cardHolder">Cardholder Name *</label>
            <input type="text" id="cardHolder" name="cardHolder" placeholder="John Doe" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="cardNumber">Card Number *</label>
            <input type="text" id="cardNumber" name="cardNumber" 
              placeholder="1234 5678 9012 3456" maxlength="19" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expiry">Expiry Date *</label>
            <input type="text" id="expiry" name="expiry" placeholder="MM/YY" maxlength="5" required>
          </div>
          <div class="form-group">
            <label for="cvv">CVV *</label>
            <input type="text" id="cvv" name="cvv" placeholder="123" maxlength="4" required>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn" ${config.isProcessing ? 'disabled' : ''}>
          ${config.isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>
        <button type="button" class="cancel-btn" ${config.isProcessing ? 'disabled' : ''}>
          Cancel
        </button>
      </div>

      ${
        config.isProcessing
          ? '<div class="payment-processing"><div class="spinner"></div><p>Processing payment...</p></div>'
          : ''
      }
    </div>
  `;

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const paymentType = (form.querySelector('input[name="paymentType"]:checked') as HTMLInputElement)
      ?.value || 'credit_card';
    const cardHolder = (form.querySelector('#cardHolder') as HTMLInputElement)?.value;
    const cardNumber = (form.querySelector('#cardNumber') as HTMLInputElement)?.value;

    const method: PaymentMethod = {
      type: paymentType as 'credit_card' | 'debit_card' | 'paypal' | 'stripe',
      holderName: cardHolder,
      lastFour: cardNumber ? cardNumber.slice(-4) : undefined
    };

    if (config.onSubmit) {
      config.onSubmit(method);
    }
  });

  // Cancel button
  const cancelBtn = form.querySelector('.cancel-btn');
  if (cancelBtn && config.onCancel) {
    cancelBtn.addEventListener('click', config.onCancel);
  }

  return form;
}
