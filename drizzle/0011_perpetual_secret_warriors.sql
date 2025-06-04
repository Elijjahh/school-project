CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "teacher_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"motivation" text NOT NULL,
	"experience" text,
	"education" text,
	"status" "application_status" DEFAULT 'pending',
	"admin_comment" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_applications" ADD CONSTRAINT "teacher_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;