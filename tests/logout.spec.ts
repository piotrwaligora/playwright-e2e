import { test, expect } from '../fixtures';

test('registered user can log out from App', async ({ loginPage, user }) => {
  await test.step('Open the login page', async () => {
    await loginPage.goto();
  });

  const contactList = await test.step('Log in through the login form', async () => {
    return loginPage.login(user.email, user.password);
  });

  const loginPageAfterLogout = await test.step('Log out user', async () => {
    return contactList.logOut();
  });

  await test.step('Verify user is logged out', async () => {
    await expect(loginPageAfterLogout.emailInput).toBeVisible();
  });
});
