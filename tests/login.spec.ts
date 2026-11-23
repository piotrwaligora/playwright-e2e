import { test, expect } from '../fixtures';
import { ContactListPage } from '../pages/ContactListPage';

// `user` is registered through the API before the test and deleted after it (see fixtures/index.ts).
// `loginPage` is a ready-made Page Object.

test('registered user can log in to Contact List App', async ({ page, loginPage, user }) => {
  await test.step('Open the login page', async () => {
    await loginPage.goto();
  });

  const contactList = await test.step('Log in through the login form', async () => {
    return loginPage.login(user.email, user.password);
  });

  await test.step('Verify the contact list is shown', async () => {
    await expect(page).toHaveURL(ContactListPage.url);
    await expect(contactList.heading).toBeVisible();
    await expect(contactList.logoutButton).toBeVisible();
  });
});
