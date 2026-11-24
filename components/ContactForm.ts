import { type Locator, type Page } from '@playwright/test';
import { type ContactData } from '../api/models';

/** Visible label of every form field. The form has real <label> elements, so getByLabel() finds the inputs. */
const LABELS: Record<keyof ContactData, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  birthdate: 'Date of Birth',
  email: 'Email',
  phone: 'Phone',
  street1: 'Street Address 1',
  street2: 'Street Address 2',
  city: 'City',
  stateProvince: 'State or Province',
  postalCode: 'Postal Code',
  country: 'Country',
};

/** Contact form shared by the Add Contact and Edit Contact pages. */
export class ContactForm {
  private readonly page: Page;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  /** Input of one field, e.g. field('city'). */
  field(name: keyof ContactData): Locator {
    return this.page.getByLabel(LABELS[name]);
  }

  /** Fills in only the fields that are given, so it serves both a new contact and an edit. */
  async fill(contact: Partial<ContactData>): Promise<void> {
    for (const [name, value] of Object.entries(contact)) {
      if (value !== undefined) {
        await this.field(name as keyof ContactData).fill(value);
      }
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
