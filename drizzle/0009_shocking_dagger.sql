ALTER TABLE "answers" DROP CONSTRAINT "answers_questionId_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_courses" DROP CONSTRAINT "users_to_courses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "courses_progress" DROP CONSTRAINT "courses_progress_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "courses_progress" DROP CONSTRAINT "courses_progress_participation_id_users_to_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_moduleId_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons_progress" DROP CONSTRAINT "lessons_progress_lesson_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons_progress" DROP CONSTRAINT "lessons_progress_participation_id_users_to_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_courseId_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "modules_progress" DROP CONSTRAINT "modules_progress_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "modules_progress" DROP CONSTRAINT "modules_progress_participation_id_users_to_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_testId_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "testAttempts" DROP CONSTRAINT "testAttempts_testId_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "tests" DROP CONSTRAINT "tests_lesson_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_courses" ADD CONSTRAINT "users_to_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_progress" ADD CONSTRAINT "courses_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_progress" ADD CONSTRAINT "courses_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_modules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_progress" ADD CONSTRAINT "lessons_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_progress" ADD CONSTRAINT "lessons_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules_progress" ADD CONSTRAINT "modules_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules_progress" ADD CONSTRAINT "modules_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testAttempts" ADD CONSTRAINT "testAttempts_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;