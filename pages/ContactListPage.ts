import { type Locator, type Page } from '@playwright/test';

/** Contact list: the page shown after a successful login ("/contactList"). */
export class ContactListPage {
  static readonly url = /\/contactList$/;

  readonly page: Page;
  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Contact List', exact: true });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }
}
