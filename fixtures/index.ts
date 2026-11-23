import { test as base, expect } from '@playwright/test';
import { UsersApi } from '../api/UsersApi';
import { newUser, type UserData } from '../data/testData';
import { LoginPage } from '../pages/LoginPage';

/** A user that exists in the application for the duration of one test. */
export type RegisteredUser = UserData & {
  id: string;
  token: string;
};

type Fixtures = {
  usersApi: UsersApi;
  user: RegisteredUser;
  loginPage: LoginPage;
};

/**
 * Tests import `test` and `expect` from here instead of '@playwright/test'.
 * Every fixture: code before `use()` is setup, `use()` runs the test, code after it is teardown.
 * A fixture is created only when a test (or another fixture) asks for it by name.
 */
export const test = base.extend<Fixtures>({
  usersApi: async ({ request }, use) => {
    await use(new UsersApi(request));
  },

  user: async ({ usersApi }, use) => {
    // Setup: register a unique user through the API
    const data = newUser();
    const response = await usersApi.register(data);
    expect(response.status(), 'register test user').toBe(201);
    const body = await response.json();

    await use({ ...data, id: body.user._id, token: body.token });

    // Teardown: runs also when the test fails.
    // Logs in again, because logging out (e.g. in a UI test) invalidates every token of the user.
    const login = await usersApi.login(data.email, data.password);
    if (login.status() === 401) {
      return; // the test has already deleted the user
    }
    expect(login.status(), 'log in test user for cleanup').toBe(200);
    const { token } = await login.json();
    expect((await usersApi.deleteMe(token)).status(), 'delete test user').toBe(200);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
