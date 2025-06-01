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
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstname: text('firstname').notNull(),
  lastname: text('lastname').notNull(),
  role: roleEnum().default('student'),
  image: text('image'),
  bio: text('bio'),
  createdAt: timestamp().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  coursesParticipations: many(coursesParticipations),
  testAttempts: many(testAttempts, { relationName: 'testAttemptsOnUsers' }),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  image: text('image'),
  createdAt: timestamp().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  creatorId: integer('creator_id')
    .notNull()
    .references(() => users.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.creatorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
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
    .references(() => users.id, { onDelete: 'restrict' }),
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
    .references(() => courses.id, { onDelete: 'restrict' }),
  participationId: integer('participation_id')
    .notNull()
    .references(() => coursesParticipations.id, { onDelete: 'restrict' }),
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
    .references(() => courses.id, { onDelete: 'restrict' }),
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
      .references(() => modules.id, { onDelete: 'restrict' }),
    participationId: integer('participation_id')
      .notNull()
      .references(() => coursesParticipations.id, { onDelete: 'restrict' }),
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
    .references(() => modules.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  videoUrl: text('video_url'),
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
      .references(() => lessons.id, { onDelete: 'restrict' }),
    participationId: integer('participation_id')
      .notNull()
      .references(() => coursesParticipations.id, { onDelete: 'restrict' }),
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
    .references(() => lessons.id, { onDelete: 'restrict' }),
  maxAttempts: integer('max_attempts').notNull().default(0),
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
    .references(() => tests.id, { onDelete: 'restrict' }),
  userId: integer('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  score: integer('score').notNull().default(0),
  totalQuestions: integer('totalQuestions').notNull(),
  completed: boolean('completed').notNull().default(false),
  datetime: timestamp().defaultNow(),
});

export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
  test: one(tests, {
    fields: [testAttempts.testId],
    references: [tests.id],
    relationName: 'testAttemptsOnTests',
  }),
  user: one(users, {
    fields: [testAttempts.userId],
    references: [users.id],
    relationName: 'testAttemptsOnUsers',
  }),
  userAnswers: many(userAnswers, { relationName: 'userAnswersOnTestAttempts' }),
}));

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  testId: integer('testId')
    .notNull()
    .references(() => tests.id, { onDelete: 'restrict' }),
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
    .references(() => questions.id, { onDelete: 'restrict' }),
  text: text('text').notNull(),
  correct: boolean('correct').notNull(),
});

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const userAnswers = pgTable('userAnswers', {
  id: serial('id').primaryKey(),
  attemptId: integer('attemptId')
    .notNull()
    .references(() => testAttempts.id, { onDelete: 'restrict' }),
  questionId: integer('questionId')
    .notNull()
    .references(() => questions.id, { onDelete: 'restrict' }),
  selectedAnswerId: integer('selectedAnswerId').references(() => answers.id, {
    onDelete: 'restrict',
  }),
  correct: boolean('correct').notNull(),
});

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [userAnswers.attemptId],
    references: [testAttempts.id],
    relationName: 'userAnswersOnTestAttempts',
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
  selectedAnswer: one(answers, {
    fields: [userAnswers.selectedAnswerId],
    references: [answers.id],
  }),
}));

export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'restrict' }),
  createdAt: timestamp().defaultNow(),
});

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [wishlist.courseId],
    references: [courses.id],
  }),
}));
