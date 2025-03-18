import { pgTable, serial, text, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core';

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
  creator_id: integer('creator_id').notNull(),
});
