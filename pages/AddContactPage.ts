import { type Locator, type Page } from '@playwright/test';
import { type ContactData } from '../api/models';
import { ContactForm } from '../components/ContactForm';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';
import { ContactListPage } from './ContactListPage';

/** Form for a new contact ("/addContact"). */
export class AddContactPage extends BasePage {
  protected readonly path = '/addContact';

  readonly header: Header;
  readonly form: ContactForm;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.form = new ContactForm(page);
    this.errorMessage = page.locator('#error');
  }

  /** Fills in and submits a valid contact; the app then goes back to the contact list. */
  async addContact(contact: ContactData): Promise<ContactListPage> {
    await this.form.fill(contact);
    await this.form.submit();
    await this.page.waitForURL(ContactListPage.url);
    return new ContactListPage(this.page);
  }
}
