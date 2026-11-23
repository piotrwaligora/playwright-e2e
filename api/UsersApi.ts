import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type UserData } from '../data/testData';

/**
 * Client of the /users endpoints. Returns raw responses, so tests decide which status they expect.
 * Paths are relative to `baseURL` from playwright.config.ts.
 */
export class UsersApi {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  register(user: UserData): Promise<APIResponse> {
    return this.request.post('/users', { data: user });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/users/login', { data: { email, password } });
  }

  getProfile(token: string): Promise<APIResponse> {
    return this.request.get('/users/me', { headers: authorization(token) });
  }

  deleteMe(token: string): Promise<APIResponse> {
    return this.request.delete('/users/me', { headers: authorization(token) });
  }
}

function authorization(token: string) {
  return { Authorization: `Bearer ${token}` };
}
