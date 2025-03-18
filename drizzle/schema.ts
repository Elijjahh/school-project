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

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  courseId: integer('courseId').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  moduleId: integer('moduleId').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
});

export const tests = pgTable('tests', {
  id: serial('id').primaryKey(),
  exampleId: integer('example_id').notNull(),
  historyAttemptsId: integer('historyAttemptsId'),
  testAttempts: integer('testAttempts'),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  creator_id: integer('creator_id').notNull(),
});
