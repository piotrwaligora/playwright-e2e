import { test, expect } from '../../fixtures';

test.describe('Logout', { tag: '@ui' }, () => {
  test('registered user can log out from App', async ({ contactListPage }) => {
    await test.step('Open the contact list as a logged in user', async () => {
      await contactListPage.goto();
    });

    const loginPageAfterLogout = await test.step('Log out user', async () => {
      return contactListPage.header.logout();
    });

    await test.step('Verify user is logged out', async () => {
      await expect(loginPageAfterLogout.heading).toBeVisible();
      await expect(loginPageAfterLogout.emailInput).toBeVisible();
    });
  });
});
