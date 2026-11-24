import { test as base, expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { ContactsApi } from '../api/ContactsApi';
import { type AuthResponse, type Contact, type UserData } from '../api/models';
import { UsersApi } from '../api/UsersApi';
import { newContact, newUser } from '../data/testData';
import { LoginPage } from '../pages/LoginPage';

/** A user that exists in the application for the duration of one test. */
export type RegisteredUser = UserData & {
  id: string;
  token: string;
};

type Fixtures = {
  /** Client without a token: registration and login. */
  usersApi: UsersApi;
  /** Registers any user data and deletes the user after the test, whatever the response was. */
  registerUser: (user: UserData) => Promise<APIResponse>;
  /** A unique registered user. */
  user: RegisteredUser;
  /** Client authenticated as `user`. */
  authUsersApi: UsersApi;
  /** Contacts client authenticated as `user`. */
  contactsApi: ContactsApi;
  /** A contact of `user`, created through the API. */
  contact: Contact;
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

  // A "factory" fixture: the test gets a function and may call it many times.
  // Every registered user is remembered and deleted in the teardown, also when the test fails.
  registerUser: async ({ request, usersApi }, use) => {
    const registered: UserData[] = [];

    await use(async (user) => {
      registered.push(user);
      return usersApi.register(user);
    });

    for (const user of registered) {
      await deleteUserWithContacts(request, user);
    }
  },

  user: async ({ registerUser }, use) => {
    const data = newUser();
    const response = await registerUser(data);
    expect(response.status(), 'register test user').toBe(201);
    const { user, token } = (await response.json()) as AuthResponse;

    await use({ ...data, id: user._id, token });
    // No teardown here: registerUser deletes the user.
  },

  authUsersApi: async ({ request, user }, use) => {
    await use(new UsersApi(request, user.token));
  },

  contactsApi: async ({ request, user }, use) => {
    await use(new ContactsApi(request, user.token));
  },

  contact: async ({ contactsApi }, use) => {
    const response = await contactsApi.create(newContact());
    expect(response.status(), 'create test contact').toBe(201);
    await use((await response.json()) as Contact);
    // No teardown here: contacts are deleted together with their user.
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };

/**
 * Deletes the user and all of its contacts. Does nothing if the user does not exist.
 * Logs in again, because logging out (e.g. in a test) invalidates every token of the user.
 */
async function deleteUserWithContacts(request: APIRequestContext, user: UserData): Promise<void> {
  const login = await new UsersApi(request).login(user.email, user.password);
  if (login.status() === 401) {
    return; // never registered or already deleted by the test
  }
  expect(login.status(), `log in ${user.email} for cleanup`).toBe(200);
  const { token } = (await login.json()) as AuthResponse;

  const contactsApi = new ContactsApi(request, token);
  const contacts = (await (await contactsApi.getAll()).json()) as Contact[];
  for (const contact of contacts) {
    expect((await contactsApi.delete(contact._id)).status(), 'delete contact in cleanup').toBe(200);
  }
  expect((await new UsersApi(request, token).deleteMe()).status(), 'delete user in cleanup').toBe(200);
}
