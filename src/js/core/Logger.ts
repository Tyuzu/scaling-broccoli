/**
 * Logger interface for abstracted logging.
 * Decouples console.log/console.error calls throughout the app.
 */

export interface ILogger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, err?: any): void;
  debug(message: string, data?: any): void;
}

/**
 * Default logger implementation
 */
export class ConsoleLogger implements ILogger {
  info(message: string, data?: any): void {
    console.info(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, err?: any): void {
    console.error(`[ERROR] ${message}`, err || '');
  }

  debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${message}`, data || '');
  }
}
