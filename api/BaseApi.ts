import { type APIRequestContext } from '@playwright/test';

/**
 * Shared part of all API clients. A client created without a token sends unauthenticated requests,
 * which is how tests check that the API rejects them.
 * Clients return raw responses, so every test decides which status it expects.
 */
export abstract class BaseApi {
  protected readonly request: APIRequestContext;
  private readonly token?: string;

  constructor(request: APIRequestContext, token?: string) {
    this.request = request;
    this.token = token;
  }

  /** Authorization header for authenticated clients, no headers otherwise. */
  protected get headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
