CREATE TABLE IF NOT EXISTS IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"followed_pet_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pet_id_1" integer NOT NULL,
	"pet_id_2" integer NOT NULL,
	"is_match" boolean DEFAULT false,
	"swipe_direction" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "medical_records" (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "pets" (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "posts" (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS "users" (
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

-- Add ai_recommendations field to pets
ALTER TABLE pets ADD COLUMN ai_recommendations TEXT;

-- Create ai_chat_usage table to track daily chat usage per user and pet
CREATE TABLE IF NOT EXISTS ai_chat_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  pet_id INTEGER NOT NULL,
  date DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_pet_date UNIQUE(user_id, pet_id, date)
); 