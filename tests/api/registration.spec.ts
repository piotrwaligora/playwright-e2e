import { type AuthResponse, type UserData } from '../../api/models';
import { uniqueId } from '../../data/testData';
import { test, expect } from '../../fixtures';

/**
 * Data-driven test: the same scenario runs once for every case, as an independent test
 * with its own user (the equivalent of a Cucumber Scenario Outline).
 * "{unique}" in the email is replaced with a value unique for the test.
 */
// One case per line reads like a table, so Prettier is told to leave the array alone:
// prettier-ignore
const cases: (UserData & { name: string })[] = [
  { name: 'typical user', firstName: 'John', lastName: 'Doe', email: 'john.doe.{unique}@example.com', password: 'Secret123' },
  { name: 'mixed case email', firstName: 'Anna', lastName: 'Kowalska', email: 'Anna.Kowalska.{unique}@Example.COM', password: 'Haslo-2024' },
  { name: 'diacritics in names', firstName: 'Zoë', lastName: 'Łukasiewicz-Żółć', email: 'zoe.{unique}@example.com', password: 'Pässwörd1' },
  { name: 'apostrophe and space', firstName: "O'Brien", lastName: 'Mc Donald', email: 'obrien_{unique}@example.co.uk', password: 'Pa$$w0rd!' },
  { name: 'short names', firstName: 'Li', lastName: 'Wu', email: 'li.{unique}@example.com', password: 'Secret123' },
  { name: 'minimum password length', firstName: 'Mia', lastName: 'Novak', email: 'mia.{unique}@example.com', password: '1234567' },
  { name: 'maximum name length', firstName: 'Maximilian-Alexander', lastName: 'Montgomery-Smithsons', email: 'max.{unique}@example.com', password: 'Secret123' },
  { name: 'plus addressing', firstName: 'Eva', lastName: 'Green', email: 'eva+newsletter.{unique}@example.com', password: 'Secret123' },
  { name: 'hyphenated domain', firstName: 'Tom', lastName: 'Hardy', email: 'tom-{unique}@test-mail.com', password: 'Secret123' },
  { name: 'passphrase password', firstName: 'Jean-Luc', lastName: 'Picard', email: 'jean.luc.{unique}@example.org', password: 'correct horse battery staple' },
];

test.describe('User registration', { tag: '@api' }, () => {
  for (const { name, ...template } of cases) {
    test(`registers a new user: ${name}`, async ({ registerUser, usersApi }) => {
      const user: UserData = { ...template, email: template.email.replace('{unique}', uniqueId()) };

      const response = await registerUser(user);

      expect(response.status(), 'registration status').toBe(201);
      const registered = (await response.json()) as AuthResponse;
      // Soft assertions: every mismatch is reported, not only the first one
      expect.soft(registered.user._id, 'id').toBeTruthy();
      expect.soft(registered.user.firstName, 'first name').toBe(user.firstName);
      expect.soft(registered.user.lastName, 'last name').toBe(user.lastName);
      expect.soft(registered.user.email, 'email is stored in lower case').toBe(user.email.toLowerCase());
      expect.soft(registered.token, 'token').toBeTruthy();

      const login = await usersApi.login(user.email, user.password);
      expect(login.status(), 'login with the registered credentials').toBe(200);
      expect(((await login.json()) as AuthResponse).user._id).toBe(registered.user._id);
    });
  }
});
