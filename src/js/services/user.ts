/**
 * User Service - handles user-related API calls
 * Decoupled from direct API imports - uses dependency injection
 */

import { BaseService } from './BaseService';
import type { IApiService } from './ApiService';
import type { IErrorHandler } from '../core/ErrorHandler';

export interface IUserService {
  getUser(id: string): Promise<{ id: string; name: string }>;
}

export class UserService extends BaseService implements IUserService {
  name = 'UserService';
  private apiService: IApiService;

  constructor(apiService: IApiService, errorHandler: IErrorHandler) {
    super(errorHandler);
    this.apiService = apiService;
  }

  async getUser(id: string): Promise<{ id: string; name: string }> {
    try {
      return await this.apiService.fetch(`/api/users/${id}`);
    } catch (err) {
      this.handleError(
        err instanceof Error ? err : new Error(String(err)),
        `UserService.getUser(${id})`
      );
      throw err;
    }
  }
}

// Export factory function for dependency injection
export function createUserService(
  apiService: IApiService,
  errorHandler: IErrorHandler
): IUserService {
  return new UserService(apiService, errorHandler);
}