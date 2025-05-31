// auth.d.ts
import type { User as DrizzleUser } from '~/drizzle/types';

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Omit<DrizzleUser, 'password'> {}
}

export {};
