import { newContact } from '../../data/testData';
import { test, expect } from '../../fixtures';

test.describe('Contacts in the UI', { tag: '@ui' }, () => {
  test('added contact is listed and shows all details', async ({ contactListPage }) => {
    const data = newContact();
    await contactListPage.goto();

    const addPage = await contactListPage.openAddContact();
    const contactList = await addPage.addContact(data);

    const row = contactList.contactRow(data);
    await expect(row).toContainText(`${data.firstName} ${data.lastName}`);
    await expect(row).toContainText(data.phone);
    const details = await contactList.openContact(data);
    expect(await details.readContact()).toEqual(data);
  });

  test('contact without the required last name is rejected', async ({ contactListPage }) => {
    await contactListPage.goto();
    const addPage = await contactListPage.openAddContact();

    await addPage.form.fill({ ...newContact(), lastName: '' });
    await addPage.form.submit();

    await expect(addPage.errorMessage).toContainText('lastName: Path `lastName` is required.');
    await expect(addPage.header.title).toHaveText('Add Contact');
  });

  test('edited contact shows the new details', async ({ contactListPage, contact }) => {
    await contactListPage.goto();
    const details = await contactListPage.openContact(contact);

    const editPage = await details.edit();
    const updated = await editPage.save({ city: 'Krakow', country: 'Poland' });

    await expect(updated.field('city')).toHaveText('Krakow');
    await expect(updated.field('country')).toHaveText('Poland');
    await expect(updated.field('lastName')).toHaveText(contact.lastName);
  });

  test('deleted contact disappears from the list', async ({ contactListPage, contact }) => {
    await contactListPage.goto();
    const details = await contactListPage.openContact(contact);

    const contactList = await details.delete();

    await expect(contactList.contactRow(contact)).toHaveCount(0);
  });
});
