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
	"user_id" varchar,
	"plant_number" integer NOT NULL,
	"baby_name" varchar(100) NOT NULL,
	"common_name" varchar(150) NOT NULL,
	"latin_name" varchar(150),
	"name" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"last_watered" timestamp,
	"next_check" timestamp,
	"last_fed" timestamp,
	"watering_frequency_days" integer DEFAULT 7,
	"feeding_frequency_days" integer DEFAULT 14,
	"notes" text,
	"image_url" text,
	"status" "plant_status" DEFAULT 'healthy',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pruning_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"pruned_at" timestamp DEFAULT now() NOT NULL,
	"parts_removed" varchar(200),
	"reason" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repotting_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"repotted_at" timestamp DEFAULT now() NOT NULL,
	"pot_size" varchar(50),
	"soil_type" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_top_up_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"topped_up_at" timestamp DEFAULT now() NOT NULL,
	"soil_type" varchar(100),
	"amount" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
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
ALTER TABLE "plants" ADD CONSTRAINT "plants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pruning_logs" ADD CONSTRAINT "pruning_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repotting_logs" ADD CONSTRAINT "repotting_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_top_up_logs" ADD CONSTRAINT "soil_top_up_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watering_logs" ADD CONSTRAINT "watering_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");