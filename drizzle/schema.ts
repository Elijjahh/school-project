import {
  pgTable,
  serial,
  text,
  pgEnum,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  coursesParticipations: many(coursesParticipations),
}));

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  creatorId: integer('creator_id')
    .notNull()
    .references(() => users.id),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.creatorId],
    references: [users.id],
  }),
  coursesParticipations: many(coursesParticipations, {
    relationName: 'coursesParticipationsOnCourses',
  }),
  coursesProgresses: many(coursesProgress, { relationName: 'coursesProgressesOnCourses' }),
}));

export const coursesParticipations = pgTable('users_to_courses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id),
});

export const coursesParticipationsRelations = relations(coursesParticipations, ({ one, many }) => ({
  course: one(courses, {
    fields: [coursesParticipations.courseId],
    references: [courses.id],
    relationName: 'coursesParticipationsOnCourses',
  }),
  user: one(users, {
    fields: [coursesParticipations.userId],
    references: [users.id],
  }),
  courseProgress: one(coursesProgress, {
    fields: [coursesParticipations.courseId],
    references: [coursesProgress.id],
  }),
  modulesProgresses: many(modulesProgress, {
    relationName: 'modulesProgressesOnCourseParticipations',
  }),
  lessonsProgresses: many(lessonsProgress, {
    relationName: 'lessonsProgressesOnCourseParticipations',
  }),
}));

export const coursesProgress = pgTable('courses_progress', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id),
  participationId: integer('participation_id')
    .notNull()
    .references(() => coursesParticipations.id),
  finished: boolean('finished').notNull(),
});

export const coursesProgressRelations = relations(coursesProgress, ({ one }) => ({
  course: one(courses, {
    fields: [coursesProgress.courseId],
    references: [courses.id],
    relationName: 'coursesProgressesOnCourses',
  }),
  participation: one(coursesParticipations, {
    fields: [coursesProgress.participationId],
    references: [coursesParticipations.id],
  }),
}));

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  courseId: integer('courseId')
    .notNull()
    .references(() => courses.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull(),
});

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  modulesProgresses: many(modulesProgress, { relationName: 'modulesProgressesOnModules' }),
  lessons: many(lessons, { relationName: 'lessonsOnModules' }),
}));

export const modulesProgress = pgTable(
  'modules_progress',
  {
    moduleId: integer('module_id')
      .notNull()
      .references(() => modules.id),
    participationId: integer('participation_id')
      .notNull()
      .references(() => coursesParticipations.id),
    finished: boolean('finished').notNull(),
  },
  (t) => [primaryKey({ columns: [t.participationId, t.moduleId] })],
);

export const modulesProgressRelations = relations(modulesProgress, ({ one }) => ({
  module: one(modules, {
    fields: [modulesProgress.moduleId],
    references: [modules.id],
    relationName: 'modulesProgressesOnModules',
  }),
  participation: one(coursesParticipations, {
    fields: [modulesProgress.participationId],
    references: [coursesParticipations.id],
    relationName: 'modulesProgressesOnCourseParticipations',
  }),
}));

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  moduleId: integer('moduleId')
    .notNull()
    .references(() => modules.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
    relationName: 'lessonsOnModules',
  }),
  lessonsProgresses: many(lessonsProgress, { relationName: 'lessonsProgressesOnLessons' }),
  tests: many(tests, { relationName: 'testsOnLessons' }),
}));

export const lessonsProgress = pgTable(
  'lessons_progress',
  {
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id),
    participationId: integer('participation_id')
      .notNull()
      .references(() => coursesParticipations.id),
    finished: boolean('finished').notNull(),
  },
  (t) => [primaryKey({ columns: [t.participationId, t.lessonId] })],
);

export const lessonsProgressRelations = relations(lessonsProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonsProgress.lessonId],
    references: [lessons.id],
    relationName: 'lessonsProgressesOnLessons',
  }),
  participation: one(coursesParticipations, {
    fields: [lessonsProgress.participationId],
    references: [coursesParticipations.id],
    relationName: 'lessonsProgressesOnCourseParticipations',
  }),
}));

export const tests = pgTable('tests', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id),
  maxAttempts: integer('lesson_id').notNull().default(0),
});

export const testsRelations = relations(tests, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [tests.lessonId],
    references: [lessons.id],
    relationName: 'testsOnLessons',
  }),
  testAttempts: many(testAttempts, { relationName: 'testAttemptsOnTests' }),
  questions: many(questions, { relationName: 'questionsOnTests' }),
}));

export const testAttempts = pgTable('testAttempts', {
  id: serial('id').primaryKey(),
  testId: integer('testId')
    .notNull()
    .references(() => tests.id),
  datetime: timestamp().defaultNow(),
});

export const testAttemptsRelations = relations(testAttempts, ({ one }) => ({
  test: one(tests, {
    fields: [testAttempts.testId],
    references: [tests.id],
    relationName: 'testAttemptsOnTests',
  }),
}));

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  testId: integer('testId')
    .notNull()
    .references(() => tests.id),
  text: text('text').notNull(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
    relationName: 'questionsOnTests',
  }),
  answers: many(answers),
}));

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  questionId: integer('questionId')
    .notNull()
    .references(() => questions.id),
  text: text('text').notNull(),
  correct: boolean('correct').notNull(),
});

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));
