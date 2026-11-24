import { type APIResponse } from '@playwright/test';
import { BaseApi } from './BaseApi';
import { type ContactData } from './models';

/** Client of the /contacts endpoints. Every endpoint requires a token. */
export class ContactsApi extends BaseApi {
  create(contact: ContactData): Promise<APIResponse> {
    return this.request.post('/contacts', { headers: this.headers, data: contact });
  }

  getAll(): Promise<APIResponse> {
    return this.request.get('/contacts', { headers: this.headers });
  }

  getById(id: string): Promise<APIResponse> {
    return this.request.get(`/contacts/${id}`, { headers: this.headers });
  }

  /** PUT replaces the whole contact: fields that are not sent are removed. */
  update(id: string, contact: ContactData): Promise<APIResponse> {
    return this.request.put(`/contacts/${id}`, { headers: this.headers, data: contact });
  }

  /** PATCH changes only the fields that are sent. */
  patch(id: string, fields: Partial<ContactData>): Promise<APIResponse> {
    return this.request.patch(`/contacts/${id}`, { headers: this.headers, data: fields });
  }

  delete(id: string): Promise<APIResponse> {
    return this.request.delete(`/contacts/${id}`, { headers: this.headers });
  }
}
