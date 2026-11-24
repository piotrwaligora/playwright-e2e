import { expect, type Locator, type Page } from '@playwright/test';
import { type ContactData } from '../api/models';
import { Header } from '../components/Header';
import { AddContactPage } from './AddContactPage';
import { BasePage } from './BasePage';
import { ContactDetailsPage } from './ContactDetailsPage';

/** Contact list: the page shown after a successful login ("/contactList"). */
export class ContactListPage extends BasePage {
  protected readonly path = '/contactList';
  static readonly url = /\/contactList$/;

  readonly header: Header;
  readonly addContactButton: Locator;
  /** The contacts table; the app renders it only after the contacts were loaded successfully. */
  readonly contactTable: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.addContactButton = page.getByRole('button', { name: 'Add a New Contact' });
    this.contactTable = page.getByRole('table');
  }

  override async goto(): Promise<void> {
    await super.goto();
    await expect(this.header.title).toHaveText('Contact List');
  }

  /** Table row of a contact. The email is unique in our test data, so it identifies the row. */
  contactRow(contact: Pick<ContactData, 'email'>): Locator {
    return this.page.getByRole('row').filter({ hasText: contact.email });
  }

  async openAddContact(): Promise<AddContactPage> {
    await this.addContactButton.click();
    return new AddContactPage(this.page);
  }

  async openContact(contact: Pick<ContactData, 'email'>): Promise<ContactDetailsPage> {
    await this.contactRow(contact).click();
    const details = new ContactDetailsPage(this.page);
    await details.waitUntilLoaded();
    return details;
  }
}
