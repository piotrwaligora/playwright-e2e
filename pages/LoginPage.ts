import { expect, type Locator, type Page } from '@playwright/test';
import { ContactListPage } from './ContactListPage';

/** Login page: the start page of Contact List App ("/"). */
export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators are lazy: nothing is searched here, only when an action or assertion uses them.
    this.heading = page.getByRole('heading', { name: 'Contact List App' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async goto(): Promise<this> {
    await this.page.goto('/');
    await expect(this.heading).toBeVisible();
    return this;
  }

  async login(email: string, password: string): Promise<ContactListPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    return new ContactListPage(this.page);
  }
}
