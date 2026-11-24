import { test, expect } from '../../fixtures';
import { ContactListPage } from '../../pages/ContactListPage';

/**
 * Self-healing demo. LoginPage finds the Submit button by its role and name ("Submit"),
 * with the element id as a fallback (see support/HealingLocator.ts).
 */

const healingAnnotations = () => test.info().annotations.filter((a) => a.type === 'self-healing');

test.describe('Self-healing locators', { tag: ['@ui', '@self-healing'] }, () => {
  test('uses the primary locator when the UI is unchanged', async ({ page, loginPage, user }) => {
    await loginPage.goto();

    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(ContactListPage.url);
    expect(healingAnnotations()).toHaveLength(0);
  });

  test('heals the locator after the button label changes', async ({ page, loginPage, user }) => {
    test.skip(process.env.SELF_HEALING === 'off', 'Self-healing is switched off');
    await loginPage.goto();
    // Simulates a UI change, e.g. a redesign that renames the button: "Submit" becomes "Sign in".
    // The primary locator getByRole('button', { name: 'Submit' }) no longer finds anything.
    await page.locator('#submit').evaluate((button) => (button.textContent = 'Sign in'));

    await loginPage.login(user.email, user.password);

    // The test still logs in, thanks to the fallback locator...
    await expect(page).toHaveURL(ContactListPage.url);
    // ...and the healing is reported, so the primary locator gets updated
    expect(healingAnnotations()).toEqual([
      expect.objectContaining({ description: expect.stringContaining('login submit button') }),
    ]);
  });
});
