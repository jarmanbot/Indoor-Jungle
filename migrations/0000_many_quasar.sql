CREATE TYPE "public"."plant_status" AS ENUM('healthy', 'check_soon', 'needs_water', 'unhealthy');--> statement-breakpoint
CREATE TABLE "custom_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "feeding_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"fed_at" timestamp DEFAULT now() NOT NULL,
	"fertilizer" varchar(100),
	"amount" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_number" integer NOT NULL,
	"baby_name" varchar(100) NOT NULL,
	"common_name" varchar(150) NOT NULL,
	"latin_name" varchar(150),
	"name" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"last_watered" timestamp,
	"next_check" timestamp,
	"last_fed" timestamp,
	"notes" text,
	"image_url" text,
	"status" "plant_status" DEFAULT 'healthy',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "watering_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"watered_at" timestamp DEFAULT now() NOT NULL,
	"amount" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "feeding_logs" ADD CONSTRAINT "feeding_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watering_logs" ADD CONSTRAINT "watering_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;