CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"followed_pet_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pet_id_1" integer NOT NULL,
	"pet_id_2" integer NOT NULL,
	"is_match" boolean DEFAULT false,
	"swipe_direction" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"appointment_id" integer,
	"veterinarian_id" integer,
	"title" text NOT NULL,
	"description" text,
	"diagnosis" text,
	"treatment" text,
	"notes" text,
	"cost" text,
	"attachments" text[] DEFAULT '{}',
	"prescriptions" text,
	"date" timestamp NOT NULL,
	"record_type" text NOT NULL,
	"type" text,
	"next_due" timestamp,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"species" text,
	"breed" text NOT NULL,
	"age" integer NOT NULL,
	"weight" text,
	"color" text,
	"gender" text NOT NULL,
	"bio" text,
	"is_public" boolean DEFAULT true,
	"profile_image" text,
	"avatar" text,
	"photos" text[] DEFAULT '{}',
	"microchip_id" text,
	"next_vaccination" timestamp,
	"last_checkup" timestamp,
	"last_visit" timestamp,
	"health_tips" text[] DEFAULT '{}',
	"diet_recommendations" text
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"location" text,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'client',
	"phone" text,
	"department" text,
	"specialization" text,
	"avatar" text,
	"bio" text,
	"location" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
