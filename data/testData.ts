import { randomInt, randomUUID } from 'node:crypto';
import { type ContactData, type UserData } from '../api/models';

/** Short unique value, so tests running in parallel never share a user or a contact. */
export function uniqueId(): string {
  return randomUUID().slice(0, 8);
}

/** A new, unique user. Pass fields to override the defaults, e.g. newUser({ firstName: 'Anna' }). */
export function newUser(overrides: Partial<UserData> = {}): UserData {
  const id = uniqueId();
  return {
    firstName: 'Test',
    lastName: `User ${id}`,
    email: `user.${id}@example.com`,
    password: `Pass-${id}`,
    ...overrides,
  };
}

/** A new, unique contact with every field filled in. */
export function newContact(overrides: Partial<ContactData> = {}): ContactData {
  const id = uniqueId();
  return {
    firstName: 'John',
    lastName: `Doe ${id}`,
    birthdate: '1990-05-15',
    email: `contact.${id}@example.com`,
    phone: randomDigits(10),
    street1: '1 Main St.',
    street2: `Apartment ${id}`,
    city: 'Anytown',
    stateProvince: 'KS',
    postalCode: randomDigits(5),
    country: 'USA',
    ...overrides,
  };
}

/** Digits without a leading zero, e.g. a phone number. */
function randomDigits(length: number): string {
  let digits = String(randomInt(1, 10));
  while (digits.length < length) {
    digits += String(randomInt(0, 10));
  }
  return digits;
}
