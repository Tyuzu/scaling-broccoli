/**
 * API Service - handles all HTTP requests
 * Provides centralized API communication with error handling
 */

import { BaseService } from './BaseService';
import type { IErrorHandler } from '../core/ErrorHandler';

export interface IApiService {
  fetch<T>(url: string, options?: RequestInit & { timeoutMs?: number }): Promise<T>;
}

export class ApiService extends BaseService implements IApiService {
  name = 'ApiService';

  constructor(errorHandler: IErrorHandler) {
    super(errorHandler);
  }

  async fetch<T>(
    url: string,
    options: RequestInit & { timeoutMs?: number } = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = options.timeoutMs
      ? setTimeout(() => controller.abort(), options.timeoutMs)
      : null;

    try {
      const headers = new Headers(options.headers || {});

      // Set default JSON header only if not provided
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      let body = options.body;

      // Automatically stringify plain objects
      if (
        body &&
        typeof body === 'object' &&
        !(body instanceof FormData) &&
        !(body instanceof Blob)
      ) {
        body = JSON.stringify(body);
      }

      const res = await fetch(url, {
        ...options,
        headers,
        body,
        signal: controller.signal
      });

      if (timeout) clearTimeout(timeout);

      // Handle empty response
      if (res.status === 204) {
        return undefined as T;
      }

      const contentType = res.headers.get('content-type') || '';

      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const error = new Error(`HTTP ${res.status}`);
        this.handleError(error, `API ${res.status}`);
        throw error;
      }

      return data as T;
    } catch (err) {
      if (timeout) clearTimeout(timeout);

      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutErr = new Error('Request timeout');
        this.handleError(timeoutErr, 'Request Timeout');
        throw timeoutErr;
      }

      if (err instanceof Error) {
        this.handleError(err, 'API Request Failed');
      }
      throw err;
    }
  }
}
