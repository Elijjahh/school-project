import { pgTable, serial, text, pgEnum, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

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
});

export const testAttempts = pgTable('testAttempts', {
  id: serial('id').primaryKey(),
  testId: integer('testId').notNull(),
  datetime: timestamp().defaultNow(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  testId: integer('testId').notNull(),
  text: text('text').notNull(),
});

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  questionId: integer('questionId').notNull(),
  text: text('text').notNull(),
  correct: boolean('correct').notNull(),
});
