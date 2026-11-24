import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';


/** Contact list: the page shown after a successful login ("/contactList"). */
export class ContactListPage extends BasePage{
  protected readonly path: string = '/contactList';
  static readonly url = /\/contactList$/;

  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Contact List', exact: true });
    this.logoutButton = this.page.getByRole('button', { name: 'Logout' });
  }

  async logOut() {
    await this.logoutButton.click();
    return new LoginPage(this.page);
  }
}