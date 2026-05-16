/**
 * Base Service abstraction
 * Provides common service interface and error handling
 */

import type { IErrorHandler } from '../core/ErrorHandler';

export interface IService {
  name: string;
}

/**
 * Abstract base service with error handling
 */
export abstract class BaseService implements IService {
  abstract name: string;

  protected errorHandler: IErrorHandler;

  constructor(errorHandler: IErrorHandler) {
    this.errorHandler = errorHandler;
  }

  protected handleError(error: Error, context?: string): void {
    this.errorHandler.handle(error, context || this.name);
  }
}
