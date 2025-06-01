CREATE TABLE "userAnswers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attemptId" integer NOT NULL,
	"questionId" integer NOT NULL,
	"selectedAnswerId" integer,
	"correct" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "testAttempts" ADD COLUMN "userId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "testAttempts" ADD COLUMN "score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "testAttempts" ADD COLUMN "totalQuestions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "testAttempts" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "userAnswers" ADD CONSTRAINT "userAnswers_attemptId_testAttempts_id_fk" FOREIGN KEY ("attemptId") REFERENCES "public"."testAttempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userAnswers" ADD CONSTRAINT "userAnswers_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userAnswers" ADD CONSTRAINT "userAnswers_selectedAnswerId_answers_id_fk" FOREIGN KEY ("selectedAnswerId") REFERENCES "public"."answers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testAttempts" ADD CONSTRAINT "testAttempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;