import { type Contact, type ContactData } from '../../api/models';
import { newContact } from '../../data/testData';
import { test, expect } from '../../fixtures';

test.describe('Contacts API', { tag: '@api' }, () => {
  test('creates a contact with all submitted fields', async ({ contactsApi, user }) => {
    const data = newContact();

    const response = await contactsApi.create(data);

    expect(response.status()).toBe(201);
    const created = (await response.json()) as Contact;
    expect(created).toMatchObject(data);
    expect(created.owner).toBe(user.id);
  });

  test('lists every contact of the user', async ({ contactsApi }) => {
    const first = (await (await contactsApi.create(newContact())).json()) as Contact;
    const second = (await (await contactsApi.create(newContact())).json()) as Contact;

    const response = await contactsApi.getAll();

    expect(response.status()).toBe(200);
    const contacts = (await response.json()) as Contact[];
    expect(contacts.map((contact) => contact._id).sort()).toEqual([first._id, second._id].sort());
  });

  test('returns a contact by id', async ({ contactsApi, contact }) => {
    const response = await contactsApi.getById(contact._id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(contact);
  });

  test('replaces all contact fields with PUT', async ({ contactsApi, contact }) => {
    const replacement = newContact();

    expect((await contactsApi.update(contact._id, replacement)).status()).toBe(200);

    const stored = (await (await contactsApi.getById(contact._id)).json()) as Contact;
    expect(stored).toMatchObject(replacement);
  });

  test('changes only the submitted fields with PATCH', async ({ contactsApi, contact }) => {
    expect((await contactsApi.patch(contact._id, { firstName: 'Anna' })).status()).toBe(200);

    const stored = (await (await contactsApi.getById(contact._id)).json()) as Contact;
    expect(stored).toEqual({ ...contact, firstName: 'Anna' });
  });

  test('deleted contact is no longer available', async ({ contactsApi, contact }) => {
    expect((await contactsApi.delete(contact._id)).status()).toBe(200);

    expect((await contactsApi.getById(contact._id)).status()).toBe(404);
  });

  test('rejects a contact without the required last name', async ({ contactsApi }) => {
    // Deliberately invalid data: undefined fields are left out of the JSON body.
    // The cast tells the compiler that we know a required field is missing.
    const withoutLastName: Partial<ContactData> = { ...newContact(), lastName: undefined };

    const response = await contactsApi.create(withoutLastName as ContactData);

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { errors: Record<string, { kind: string }> };
    expect(body.errors.lastName?.kind).toBe('required');
  });

  test('rejects a request without a token', async ({ request }) => {
    const response = await request.get('/contacts');

    expect(response.status()).toBe(401);
  });
});
