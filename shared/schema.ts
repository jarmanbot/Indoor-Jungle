import { pgTable, text, serial, integer, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// -------------------- User Schema --------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// -------------------- Plant Schema --------------------

// Plant status types
export const plantStatusEnum = pgEnum("plant_status", [
  "healthy",
  "check_soon", 
  "needs_water",
  "unhealthy"
]);

// Export the values as a type for use in the frontend
export type PlantStatus = "healthy" | "check_soon" | "needs_water" | "unhealthy";

// Also export as an enum for easier use in components
export const PlantStatus = {
  HEALTHY: "healthy" as const,
  CHECK_SOON: "check_soon" as const,
  NEEDS_WATER: "needs_water" as const,
  UNHEALTHY: "unhealthy" as const
};

// Common plant locations (predefined options)
export const plantLocations = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "balcony", label: "Balcony" },
  { value: "outdoor", label: "Outdoor" },
  { value: "patio", label: "Patio" },
  { value: "garden", label: "Garden" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "other", label: "Other" }
] as const;

// Derivation of the type for compile-time safety
export type PlantLocationValue = typeof plantLocations[number]['value'];

// Plants table definition
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  plantNumber: integer("plant_number").notNull(),
  
  // Names
  babyName: varchar("baby_name", { length: 100 }).notNull(),     // Personal/pet name (e.g., "Monty")
  commonName: varchar("common_name", { length: 150 }).notNull(), // Common name (e.g., "Swiss Cheese Plant")
  latinName: varchar("latin_name", { length: 150 }),             // Scientific name (e.g., "Monstera Deliciosa")
  
  // For backward compatibility
  name: varchar("name", { length: 100 }).notNull(),
  
  // Care information
  location: varchar("location", { length: 100 }).notNull(),
  lastWatered: timestamp("last_watered"),
  nextCheck: timestamp("next_check"),
  lastFed: timestamp("last_fed"),
  wateringFrequencyDays: integer("watering_frequency_days").default(7), // Default to weekly
  feedingFrequencyDays: integer("feeding_frequency_days").default(14), // Default to bi-weekly
  notes: text("notes"),
  
  // Images and status
  imageUrl: text("image_url"),
  status: plantStatusEnum("status").default("healthy"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom locations table to store user-defined locations
export const customLocations = pgTable("custom_locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for validating plant data on insert/update
export const insertPlantSchema = createInsertSchema(plants, {
  // Improve date handling with flexible types
  lastWatered: z.union([z.string(), z.date(), z.null()]).optional(),
  nextCheck: z.union([z.string(), z.date(), z.null()]).optional(),
  lastFed: z.union([z.string(), z.date(), z.null()]).optional(),
  
  // Make notes optional
  notes: z.string().optional(),
  
  // Add specific validation for names
  babyName: z.string().min(1, "Baby name is required"),
  commonName: z.string().min(1, "Common name is required"),
  latinName: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for validating custom locations
export const insertCustomLocationSchema = createInsertSchema(customLocations, {
  name: z.string().min(1, "Location name is required"),
}).omit({
  id: true,
  createdAt: true,
});

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;

export type CustomLocation = typeof customLocations.$inferSelect;
export type InsertCustomLocation = z.infer<typeof insertCustomLocationSchema>;

// -------------------- Plant Care Logs --------------------

// Water logs to track watering history
export const wateringLogs = pgTable("watering_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  wateredAt: timestamp("watered_at").defaultNow().notNull(),
  amount: varchar("amount", { length: 50 }), // e.g., "full", "light", "1 cup"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feeding logs to track fertilization history
export const feedingLogs = pgTable("feeding_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  fedAt: timestamp("fed_at").defaultNow().notNull(),
  fertilizer: varchar("fertilizer", { length: 100 }),
  amount: varchar("amount", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Repotting logs to track when plants are repotted
export const repottingLogs = pgTable("repotting_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  repottedAt: timestamp("repotted_at").defaultNow().notNull(),
  potSize: varchar("pot_size", { length: 50 }),
  soilType: varchar("soil_type", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Soil top up logs to track soil additions
export const soilTopUpLogs = pgTable("soil_top_up_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  toppedUpAt: timestamp("topped_up_at").defaultNow().notNull(),
  soilType: varchar("soil_type", { length: 100 }),
  amount: varchar("amount", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pruning logs to track pruning activities
export const pruningLogs = pgTable("pruning_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  prunedAt: timestamp("pruned_at").defaultNow().notNull(),
  partsRemoved: varchar("parts_removed", { length: 200 }),
  reason: varchar("reason", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for logs
export const insertWateringLogSchema = createInsertSchema(wateringLogs, {
  wateredAt: z.union([z.string(), z.date()]).optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertFeedingLogSchema = createInsertSchema(feedingLogs, {
  fedAt: z.union([z.string(), z.date()]).optional(),
  fertilizer: z.string().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertRepottingLogSchema = createInsertSchema(repottingLogs, {
  repottedAt: z.union([z.string(), z.date()]).optional(),
  potSize: z.string().optional(),
  soilType: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertSoilTopUpLogSchema = createInsertSchema(soilTopUpLogs, {
  toppedUpAt: z.union([z.string(), z.date()]).optional(),
  soilType: z.string().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertPruningLogSchema = createInsertSchema(pruningLogs, {
  prunedAt: z.union([z.string(), z.date()]).optional(),
  partsRemoved: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Types for TypeScript
export type WateringLog = typeof wateringLogs.$inferSelect;
export type InsertWateringLog = z.infer<typeof insertWateringLogSchema>;

export type FeedingLog = typeof feedingLogs.$inferSelect;
export type InsertFeedingLog = z.infer<typeof insertFeedingLogSchema>;

export type RepottingLog = typeof repottingLogs.$inferSelect;
export type InsertRepottingLog = z.infer<typeof insertRepottingLogSchema>;

export type SoilTopUpLog = typeof soilTopUpLogs.$inferSelect;
export type InsertSoilTopUpLog = z.infer<typeof insertSoilTopUpLogSchema>;

export type PruningLog = typeof pruningLogs.$inferSelect;
export type InsertPruningLog = z.infer<typeof insertPruningLogSchema>;
