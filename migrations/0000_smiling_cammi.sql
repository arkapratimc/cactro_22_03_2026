CREATE TABLE "releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"release_date" text NOT NULL,
	"additional_info" text,
	"completed_steps" text[] DEFAULT '{}' NOT NULL
);
