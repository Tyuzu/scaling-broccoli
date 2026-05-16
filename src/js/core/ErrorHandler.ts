/**
 * Error handler interface for centralized error management.
 * Decouples error handling from specific implementations.
 */

import type { ILogger } from './Logger';
import { eventBus, Events } from './EventEmitter';

export interface IErrorHandler {
  handle(error: Error | string, context?: string): void;
  handleAsync(error: Error, context?: string): Promise<void>;
}

/**
 * Default error handler implementation
 */
export class DefaultErrorHandler implements IErrorHandler {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  handle(error: Error | string, context: string = 'Unknown'): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`[${context}] ${errorMsg}`, stack);

    // Emit error event for UI to handle
    eventBus.emit(Events.ERROR, { errorMsg, context });
  }

  async handleAsync(error: Error, context: string = 'Unknown'): Promise<void> {
    this.handle(error, context);
  }
}
