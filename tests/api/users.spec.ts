import { type AuthResponse, type User } from '../../api/models';
import { test, expect } from '../../fixtures';

test.describe('Users API', { tag: '@api' }, () => {
  test('returns the profile of the registered user', async ({ authUsersApi, user }) => {
    const response = await authUsersApi.getProfile();

    expect(response.status()).toBe(200);
    expect((await response.json()) as User).toMatchObject({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  });

  test('updates only the submitted profile fields with PATCH', async ({ authUsersApi, user }) => {
    const response = await authUsersApi.updateProfile({ firstName: 'Anna' });

    expect(response.status()).toBe(200);
    expect((await response.json()) as User).toMatchObject({ firstName: 'Anna', lastName: user.lastName });
  });

  test('logs in with valid credentials', async ({ usersApi, user }) => {
    const response = await usersApi.login(user.email, user.password);

    expect(response.status()).toBe(200);
    const login = (await response.json()) as AuthResponse;
    expect(login.token).toBeTruthy();
    expect(login.user._id).toBe(user.id);
  });

  test('rejects login with a wrong password', async ({ usersApi, user }) => {
    const response = await usersApi.login(user.email, `wrong-${user.password}`);

    expect(response.status()).toBe(401);
  });

  test('rejects registration with an email that is already in use', async ({ registerUser, user }) => {
    const response = await registerUser(user);

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Email address is already in use' });
  });

  test('invalidates the token on logout', async ({ authUsersApi }) => {
    expect((await authUsersApi.logout()).status()).toBe(200);

    expect((await authUsersApi.getProfile()).status()).toBe(401);
  });

  test('deleted user can no longer log in', async ({ authUsersApi, usersApi, user }) => {
    expect((await authUsersApi.deleteMe()).status()).toBe(200);

    expect((await usersApi.login(user.email, user.password)).status()).toBe(401);
  });
});
