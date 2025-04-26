ALTER TABLE "tests" ALTER COLUMN "lesson_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "max_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;