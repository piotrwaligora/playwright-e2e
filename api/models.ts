/**
 * Shapes of the data sent to and returned by the Contact List API.
 * Types exist only for the compiler: nothing checks at runtime that a response really looks like this.
 */

/** Body of POST /users (registration). */
export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** A user as returned by the API (the password is never returned). */
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

/** Response of registration and login. */
export type AuthResponse = {
  user: User;
  token: string;
};

/** Body of POST /contacts and PUT /contacts/:id. Only firstName and lastName are required by the API. */
export type ContactData = {
  firstName: string;
  lastName: string;
  birthdate?: string;
  email?: string;
  phone?: string;
  street1?: string;
  street2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
};

/** A contact as returned by the API: the submitted data plus server-generated fields. */
export type Contact = ContactData & {
  _id: string;
  owner: string;
};
