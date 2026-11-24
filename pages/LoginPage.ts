import { expect, type Locator, type Page } from '@playwright/test';
import { ContactListPage } from './ContactListPage';
import { BasePage } from './BasePage';

/** Login page: the start page of Contact List App ("/"). */
export class LoginPage extends BasePage {
  protected readonly path: string = '/';
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Locators are lazy: nothing is searched here, only when an action or assertion uses them.
    this.heading = page.getByRole('heading', { name: 'Contact List App' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    // A plain <span id="error"> with no accessible role or label: an id is the best locator here
    this.errorMessage = page.locator('#error');
  }

  override async goto() {
    await super.goto();
    await expect(this.heading).toBeVisible();
  }

  async login(email: string, password: string): Promise<ContactListPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    return new ContactListPage(this.page);
  }
}
