import { type APIResponse } from '@playwright/test';
import { BaseApi } from './BaseApi';
import { type UserData } from './models';

/** Client of the /users endpoints. Registration and login do not need a token. */
export class UsersApi extends BaseApi {
  register(user: UserData): Promise<APIResponse> {
    return this.request.post('/users', { data: user });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/users/login', { data: { email, password } });
  }

  getProfile(): Promise<APIResponse> {
    return this.request.get('/users/me', { headers: this.headers });
  }

  updateProfile(fields: Partial<UserData>): Promise<APIResponse> {
    return this.request.patch('/users/me', { headers: this.headers, data: fields });
  }

  /** Note: the API invalidates every token of the user, not only the one used here. */
  logout(): Promise<APIResponse> {
    return this.request.post('/users/logout', { headers: this.headers });
  }

  deleteMe(): Promise<APIResponse> {
    return this.request.delete('/users/me', { headers: this.headers });
  }
}
