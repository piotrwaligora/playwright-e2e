import { type Contact } from '../../api/models';
import { newContact, uniqueId } from '../../data/testData';
import { test, expect } from '../../fixtures';

/**
 * Network mocking: Playwright intercepts the requests the page sends to the API (page.route)
 * and answers them itself, or lets them through and only watches them.
 * Nothing changes on the server: only this test's browser sees the mocked responses.
 * A route must be registered before the page sends the request, so before goto().
 */

/** Matches the list endpoint (GET/POST /contacts) but not /contacts/:id. */
const CONTACTS = '**/contacts';

/** A contact as the API would return it, without creating anything in the database. */
function fakeContact(overrides: Partial<Contact> = {}): Required<Contact> {
  return { ...newContact(), _id: uniqueId(), owner: 'mocked-owner', ...overrides };
}

test.describe('Network mocking', { tag: ['@ui', '@mock'] }, () => {
  test('renders the contacts returned by the API', async ({ page, contactListPage }) => {
    const kansas = fakeContact({ city: 'Anytown', stateProvince: 'KS', postalCode: '12345' });
    const polish = fakeContact({ firstName: 'Zoë', lastName: 'Łukasiewicz' });
    // The browser gets this JSON instead of asking the real API
    await page.route(CONTACTS, (route) => route.fulfill({ json: [kansas, polish] }));

    await contactListPage.goto();

    await expect(page.getByRole('row')).toHaveCount(3); // header row + 2 contacts
    const kansasRow = contactListPage.contactRow(kansas);
    await expect(kansasRow).toContainText(`${kansas.firstName} ${kansas.lastName}`);
    // The UI joins three fields into one cell: a formatting rule tested without any real data
    await expect(kansasRow.getByRole('cell', { name: 'Anytown KS 12345' })).toBeVisible();
    await expect(contactListPage.contactRow(polish)).toContainText('Zoë Łukasiewicz');
  });

  test('shows a contact injected into the real API response', async ({ page, contactListPage, contact }) => {
    const injected = fakeContact();
    // Partial mock: the request goes to the real API, the test only adds one contact to the answer
    await page.route(CONTACTS, async (route) => {
      const response = await route.fetch();
      const realContacts = (await response.json()) as Contact[];
      await route.fulfill({ response, json: [...realContacts, injected] });
    });

    await contactListPage.goto();

    await expect(contactListPage.contactRow(contact)).toBeVisible(); // real, created by the fixture
    await expect(contactListPage.contactRow(injected)).toBeVisible(); // exists only in the response
  });

  test('server error while loading contacts leaves the list empty', async ({ page, contactListPage }) => {
    await page.route(CONTACTS, (route) => route.fulfill({ status: 500, json: { error: 'Internal error' } }));

    // Wait for the (mocked) response first: checking that the table is hidden any earlier
    // would pass trivially, before the page even tried to render it.
    await Promise.all([page.waitForResponse(CONTACTS), contactListPage.goto()]);

    await expect(contactListPage.contactTable).toBeHidden();
    await expect(contactListPage.addContactButton).toBeEnabled();
    // Current behaviour of the app: no error message is shown to the user.
    // Worth reporting as a UX issue; this test documents it and will fail when it changes.
  });

  test('network failure while loading contacts raises a page error', async ({ page, contactListPage }) => {
    await page.route(CONTACTS, (route) => route.abort('internetdisconnected'));
    const pageError = page.waitForEvent('pageerror'); // an uncaught JavaScript error in the page

    await contactListPage.goto();

    const error = await pageError;
    test.info().annotations.push({ type: 'page error', description: error.message });
    await expect(contactListPage.contactTable).toBeHidden();
    await expect(contactListPage.header.logoutButton).toBeVisible();
  });

  test('API error while saving a contact shows the message from the API', async ({
    page,
    contactListPage,
  }) => {
    // Only POST is mocked; GET /contacts (the list) still reaches the real API
    await page.route(CONTACTS, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 503, json: { message: 'Service temporarily unavailable' } });
      } else {
        await route.continue();
      }
    });
    await contactListPage.goto();
    const addPage = await contactListPage.openAddContact();

    await addPage.form.fill(newContact());
    await addPage.form.submit();

    await expect(addPage.errorMessage).toHaveText('Service temporarily unavailable');
    await expect(addPage.header.title).toHaveText('Add Contact');
  });

  test('saving a contact sends the form data to the API', async ({ page, contactListPage }) => {
    const data = newContact();
    await contactListPage.goto();
    const addPage = await contactListPage.openAddContact();
    await addPage.form.fill(data);

    // Nothing is mocked: the test listens to the real traffic.
    // Start waiting before the click, otherwise the request could be sent before anyone listens.
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().endsWith('/contacts') && req.method() === 'POST'),
      addPage.form.submit(),
    ]);

    expect(request.postDataJSON()).toEqual(data);
    expect(request.headers()['authorization']).toMatch(/^Bearer .+/);
    // Only the status: right after saving, the app navigates to the contact list and the browser
    // discards the response body of the previous page, so reading it would fail. The stored data
    // is checked in the hybrid tests (tests/e2e).
    const response = await request.response();
    expect(response?.status()).toBe(201);
  });
});
