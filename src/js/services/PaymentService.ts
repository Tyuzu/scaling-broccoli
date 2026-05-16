/**
 * PaymentService - Manages payment processing
 * Handles payment validation and processing (integrable with payment providers)
 */

import { BaseService } from './BaseService';
import { eventBus, Events } from '../core/EventEmitter';
import type { IErrorHandler } from '../core/ErrorHandler';

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe';
  lastFour?: string;
  holderName?: string;
}

export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: number;
}

export class PaymentService extends BaseService {
  name = 'PaymentService';
  private processingPayments = new Map<string, PaymentDetails>();

  constructor(errorHandler: IErrorHandler) {
    super(errorHandler);
  }

  /**
   * Process payment (mock implementation)
   * In production, integrate with Stripe, PayPal, etc.
   */
  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      // Validate payment details
      if (!this.validatePaymentDetails(details)) {
        throw new Error('Invalid payment details');
      }

      // Simulate payment processing delay
      eventBus.emit(Events.PAYMENT_INITIATED, { orderId: details.orderId });
      this.processingPayments.set(details.orderId, details);

      // Simulate API call delay (200-500ms)
      await this.simulatePaymentProcessing();

      // Mock: 95% success rate
      const isSuccess = Math.random() < 0.95;

      if (!isSuccess) {
        throw new Error('Payment declined by processor');
      }

      const result: PaymentResult = {
        success: true,
        transactionId: this.generateTransactionId(),
        timestamp: Date.now()
      };

      this.processingPayments.delete(details.orderId);
      eventBus.emit(Events.PAYMENT_PROCESSED, { orderId: details.orderId, result });
      return result;
    } catch (error) {
      this.processingPayments.delete(details.orderId);
      const result: PaymentResult = {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };

      this.handleError(error as Error, 'processPayment');
      eventBus.emit(Events.PAYMENT_FAILED, { orderId: details.orderId, error });
      return result;
    }
  }

  /**
   * Check if payment is processing
   */
  isProcessing(orderId: string): boolean {
    return this.processingPayments.has(orderId);
  }

  /**
   * Get payment status
   */
  getPaymentStatus(orderId: string): 'processing' | 'not_found' {
    return this.processingPayments.has(orderId) ? 'processing' : 'not_found';
  }

  /**
   * Private: Validate payment details
   */
  private validatePaymentDetails(details: PaymentDetails): boolean {
    return !!(
      details.orderId &&
      details.amount > 0 &&
      details.currency &&
      details.method &&
      details.method.type
    );
  }

  /**
   * Private: Simulate payment processing delay
   */
  private simulatePaymentProcessing(): Promise<void> {
    const delay = Math.random() * 300 + 200; // 200-500ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Private: Generate transaction ID
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
