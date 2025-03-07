import { pgTable, serial, text, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { integer, pgTable } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  role: roleEnum().default('student'),
  createdAt: timestamp().defaultNow(),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  creater_id: integer('creater_id').notNull(),
});
