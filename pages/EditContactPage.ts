import { expect, type Page } from '@playwright/test';
import { type ContactData } from '../api/models';
import { ContactForm } from '../components/ContactForm';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';
import { ContactDetailsPage } from './ContactDetailsPage';

/** Form with the current data of a contact ("/editContact"). The data is loaded after the page opens. */
export class EditContactPage extends BasePage {
  protected readonly path = '/editContact';

  readonly header: Header;
  readonly form: ContactForm;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.form = new ContactForm(page);
  }

  /**
   * Waits until the current data is in the form. Typing earlier is a race:
   * the loaded data could overwrite what the test typed.
   */
  async waitUntilLoaded(): Promise<void> {
    await expect(this.form.field('lastName')).not.toHaveValue('');
  }

  /** Changes the given fields, saves, and returns the details page with the saved data. */
  async save(changes: Partial<ContactData>): Promise<ContactDetailsPage> {
    await this.form.fill(changes);
    await this.form.submit();
    const details = new ContactDetailsPage(this.page);
    await details.waitUntilLoaded();
    return details;
  }
}
