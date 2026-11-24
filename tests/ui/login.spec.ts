import { test, expect } from '../../fixtures';
import { ContactListPage } from '../../pages/ContactListPage';

// The only tests that go through the login form. Every other UI test starts logged in (contactListPage fixture).

test.describe('Login', { tag: '@ui' }, () => {
  test(
    'registered user can log in to Contact List App',
    { tag: '@smoke' },
    async ({ page, loginPage, user }) => {
      await test.step('Open the login page', async () => {
        await loginPage.goto();
      });

      const contactList = await test.step('Log in through the login form', async () => {
        return loginPage.login(user.email, user.password);
      });

      await test.step('Verify the contact list is shown', async () => {
        await expect(page).toHaveURL(ContactListPage.url);
        await expect(contactList.header.title).toHaveText('Contact List');
        await expect(contactList.header.logoutButton).toBeVisible();
      });
    },
  );

  test('login with a wrong password shows an error', async ({ page, loginPage, user }) => {
    await loginPage.goto();

    await loginPage.login(user.email, `wrong-${user.password}`);

    await expect(loginPage.errorMessage).toHaveText('Incorrect username or password');
    await expect(page).not.toHaveURL(ContactListPage.url);
  });
});
