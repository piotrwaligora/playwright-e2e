import { type Contact } from '../../api/models';
import { newContact } from '../../data/testData';
import { test, expect } from '../../fixtures';

// Hybrid tests: data is prepared through the fast API and checked in the UI, or the other way round.

test.describe('Contacts: API and UI', { tag: '@ui' }, () => {
  test(
    'contact created through the API is shown in the UI',
    { tag: '@smoke' },
    async ({ contactListPage, contact }) => {
      // `contact` was created through the API by its fixture; the page is opened afterwards
      await contactListPage.goto();

      const row = contactListPage.contactRow(contact);
      await expect(row).toContainText(`${contact.firstName} ${contact.lastName}`);
      await expect(row).toContainText(contact.country);
      const details = await contactListPage.openContact(contact);
      expect(contact).toMatchObject(await details.readContact());
    },
  );

  test('contact added in the UI is stored and returned by the API', async ({
    contactListPage,
    contactsApi,
    user,
  }) => {
    const data = newContact();
    await contactListPage.goto();

    const addPage = await contactListPage.openAddContact();
    const contactList = await addPage.addContact(data);
    await expect(contactList.contactRow(data)).toBeVisible();

    const response = await contactsApi.getAll();
    expect(response.status()).toBe(200);
    const stored = (await response.json()) as Contact[];
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ ...data, owner: user.id });
  });

  test('contact edited in the UI has the new data in the API', async ({
    contactListPage,
    contactsApi,
    contact,
  }) => {
    await contactListPage.goto();
    const details = await contactListPage.openContact(contact);

    const editPage = await details.edit();
    await editPage.save({ city: 'Krakow', postalCode: '30-001' });

    const stored = (await (await contactsApi.getById(contact._id)).json()) as Contact;
    expect(stored).toEqual({ ...contact, city: 'Krakow', postalCode: '30-001' });
  });
});
