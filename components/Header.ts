import { type Locator, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Page header shown on every page after login: page title and the Logout button.
 * A component, not a page: pages *have* a header (composition) instead of inheriting it.
 */
export class Header {
  private readonly page: Page;
  readonly title: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Every locator is searched only inside <header> (role "banner"), never in the rest of the page
    const root = page.getByRole('banner');
    this.title = root.getByRole('heading', { level: 1 });
    this.logoutButton = root.getByRole('button', { name: 'Logout' });
  }

  async logout(): Promise<LoginPage> {
    await this.logoutButton.click();
    return new LoginPage(this.page);
  }
}
