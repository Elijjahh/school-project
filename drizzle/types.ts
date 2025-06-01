import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  users,
  categories,
  courses,
  coursesParticipations,
  coursesProgress,
  modules,
  modulesProgress,
  lessons,
  lessonsProgress,
  tests,
  testAttempts,
  questions,
  answers,
  wishlist,
} from './schema';

// User types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Category types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// Course types
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

// Course participation types
export type CourseParticipation = typeof coursesParticipations.$inferSelect;
export type NewCourseParticipation = typeof coursesParticipations.$inferInsert;

// Course progress types
export type CourseProgress = typeof coursesProgress.$inferSelect;
export type NewCourseProgress = typeof coursesProgress.$inferInsert;

// Module types
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

// Module progress types
export type ModuleProgress = typeof modulesProgress.$inferSelect;
export type NewModuleProgress = typeof modulesProgress.$inferInsert;

// Lesson types
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

// Lesson progress types
export type LessonProgress = typeof lessonsProgress.$inferSelect;
export type NewLessonProgress = typeof lessonsProgress.$inferInsert;

// Test types
export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;

// Test attempt types
export type TestAttempt = typeof testAttempts.$inferSelect;
export type NewTestAttempt = typeof testAttempts.$inferInsert;

// Question types
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

// Answer types
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

// Wishlist types
export type WishlistItem = typeof wishlist.$inferSelect;
export type NewWishlistItem = typeof wishlist.$inferInsert;

// Alternative syntax using InferSelectModel/InferInsertModel (deprecated but still available)
export type UserSelect = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;

export type CategorySelect = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;

export type CourseSelect = InferSelectModel<typeof courses>;
export type CourseInsert = InferInsertModel<typeof courses>;

// Complex types with relations
export type CourseWithDetails = Course & {
  creator: User;
  category: Category;
  modules?: ModuleWithLessonsAndTests[];
  isParticipating?: boolean;
  isInWishlist?: boolean;
};

export type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

export type ModuleWithLessonsAndTests = Module & {
  lessons: LessonWithTests[];
};

export type LessonWithTests = Lesson & {
  tests: TestWithStats[];
};

export type TestWithStats = Test & {
  questionsCount: number;
};

export type UserWithCourses = User & {
  courses?: Course[];
  coursesParticipations?: CourseParticipation[];
};

export type QuestionWithAnswers = Question & {
  answers: Answer[];
};

export type TestWithQuestions = Test & {
  questions: QuestionWithAnswers[];
};

// Extended types for UI components
export type CourseCardData = {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  completed?: boolean;
  progress?: number;
  category?: string;
  studentsCount?: number;
  creator?: { id: number };
};

export type StatsData = {
  enrolledCourses: number;
  activeCourses: number;
  completedCourses: number;
  instructors: number;
};

export type TeacherStatsData = {
  studentsCount: number;
  coursesCount: number;
  finishedParticipations: number;
};

// Role-specific types
export type UserRole = 'student' | 'teacher' | 'admin';

export type TeacherUser = User & {
  role: 'teacher';
  bio: string;
};

export type StudentUser = User & {
  role: 'student';
};

// API response types
export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Additional UI-specific types
export type LessonPayload = {
  title: string;
  content: string;
  videoUrl?: string;
};

// Update payloads for edit forms
export type LessonUpdatePayload = {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
};

export type ModuleUpdatePayload = {
  title: string;
  description: string;
  order: number;
};

export type CourseUpdatePayload = {
  title: string;
  description: string;
  image: string;
  categoryId: number;
};

// Course with additional UI fields for pages/components
export type CourseWithUIFields = Course & {
  category?: string;
  studentsCount?: number;
  progress?: number;
  lastAccessed?: string;
  completed?: boolean;
  teacher?: User;
};

// For server middleware authentication
export type AuthenticatedUser = User;

// For course details page
export type Teacher = User;

// Category with additional fields for forms
export type CategoryOption = {
  id: string;
  label: string;
};
