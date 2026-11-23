import { randomUUID } from 'node:crypto';

export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** Unique data for every call, so tests running in parallel never share a user. */
export function newUser(): UserData {
  const id = randomUUID().slice(0, 8);
  return {
    firstName: 'Test',
    lastName: `User ${id}`,
    email: `user.${id}@example.com`,
    password: `Pass-${id}`,
  };
}
