import { faker } from '@faker-js/faker';
import type { CreateUserInput } from '../../src/api/schemas/user.schema.js';

/**
 * Dynamic `users` test data. Pure — returns a plain object, performs no I/O.
 */
export function buildUser(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number(),
    website: faker.internet.domainName(),
    ...overrides,
  };
}
