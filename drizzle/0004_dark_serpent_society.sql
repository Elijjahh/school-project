ALTER TABLE "users_to_courses" DROP CONSTRAINT "users_to_courses_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_courses" ADD CONSTRAINT "users_to_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");