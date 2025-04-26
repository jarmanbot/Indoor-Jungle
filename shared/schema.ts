import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Plant status enum
export enum PlantStatus {
  HEALTHY = "healthy",
  CHECK_SOON = "check_soon",
  NEEDS_WATER = "needs_water",
}

// Location enum
export enum PlantLocation {
  LIVING_ROOM = "living_room",
  BEDROOM = "bedroom",
  KITCHEN = "kitchen",
  BATHROOM = "bathroom",
  OFFICE = "office",
  BALCONY = "balcony",
  OTHER = "other",
}

// Plants table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  plantNumber: integer("plant_number"),
  name: varchar("name", { length: 100 }).notNull(),  // Required for backwards compatibility
  babyName: varchar("baby_name", { length: 100 }).notNull(),
  latinName: varchar("latin_name", { length: 150 }),
  commonName: varchar("common_name", { length: 150 }).notNull(),
  imageUrl: text("image_url"),
  location: varchar("location", { length: 50 }).notNull(),
  lastWatered: timestamp("last_watered"),
  nextCheck: timestamp("next_check"),
  lastFed: timestamp("last_fed"),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default(PlantStatus.HEALTHY),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create a schema with modified date handling
export const insertPlantSchema = createInsertSchema(plants, {
  lastWatered: z.union([z.string(), z.date(), z.null()]).optional(),
  nextCheck: z.union([z.string(), z.date(), z.null()]).optional(),
  lastFed: z.union([z.string(), z.date(), z.null()]).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
