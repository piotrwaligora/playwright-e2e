import { expect, type Locator, type Page } from '@playwright/test';
import { type ContactData } from '../api/models';
import { Header } from '../components/Header';
import { BasePage } from './BasePage';
import { ContactListPage } from './ContactListPage';
import { EditContactPage } from './EditContactPage';

const FIELDS: (keyof ContactData)[] = [
  'firstName',
  'lastName',
  'birthdate',
  'email',
  'phone',
  'street1',
  'street2',
  'city',
  'stateProvince',
  'postalCode',
  'country',
];

/** Read-only details of one contact ("/contactDetails"). The data is loaded after the page opens. */
export class ContactDetailsPage extends BasePage {
  protected readonly path = '/contactDetails';

  readonly header: Header;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly returnButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.editButton = page.getByRole('button', { name: 'Edit Contact' });
    this.deleteButton = page.getByRole('button', { name: 'Delete Contact' });
    this.returnButton = page.getByRole('button', { name: 'Return to Contact List' });
  }

  /**
   * Value of one field. Values are <span> elements; their <label for> does not make them
   * accessible by label (a span is not a form control), so the ids are used.
   */
  field(name: keyof ContactData): Locator {
    return this.page.locator('#contactDetails').locator(`#${name}`);
  }

  /** Waits until the contact data has been loaded into the page. */
  async waitUntilLoaded(): Promise<void> {
    await expect(this.field('lastName')).not.toBeEmpty();
  }

  /** Reads every field, for comparison with the expected contact data. */
  async readContact(): Promise<ContactData> {
    await this.waitUntilLoaded();
    const contact: Partial<ContactData> = {};
    for (const name of FIELDS) {
      contact[name] = (await this.field(name).textContent()) ?? '';
    }
    return contact as ContactData;
  }

  async edit(): Promise<EditContactPage> {
    await this.editButton.click();
    const editPage = new EditContactPage(this.page);
    await editPage.waitUntilLoaded();
    return editPage;
  }

  /**
   * Deletes the contact. The app asks "Are you sure...?" in a browser confirm dialog.
   * Playwright dismisses dialogs by default, so the dialog has to be accepted explicitly,
   * and the handler must be registered before the click that opens it.
   */
  async delete(): Promise<ContactListPage> {
    this.page.once('dialog', (dialog) => void dialog.accept());
    await this.deleteButton.click();
    await this.page.waitForURL(ContactListPage.url);
    return new ContactListPage(this.page);
  }
}
