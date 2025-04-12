CREATE TABLE "users_to_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"participation_id" integer NOT NULL,
	"finished" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons_progress" (
	"lesson_id" integer NOT NULL,
	"participation_id" integer NOT NULL,
	"finished" boolean NOT NULL,
	CONSTRAINT "lessons_progress_participation_id_lesson_id_pk" PRIMARY KEY("participation_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "modules_progress" (
	"module_id" integer NOT NULL,
	"participation_id" integer NOT NULL,
	"finished" boolean NOT NULL,
	CONSTRAINT "modules_progress_participation_id_module_id_pk" PRIMARY KEY("participation_id","module_id")
);
--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "lesson_id" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_courses" ADD CONSTRAINT "users_to_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_courses" ADD CONSTRAINT "users_to_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_progress" ADD CONSTRAINT "courses_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_progress" ADD CONSTRAINT "courses_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_progress" ADD CONSTRAINT "lessons_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_progress" ADD CONSTRAINT "lessons_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules_progress" ADD CONSTRAINT "modules_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules_progress" ADD CONSTRAINT "modules_progress_participation_id_users_to_courses_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."users_to_courses"("id") ON DELETE no action ON UPDATE no action;