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

// Plant categories for seasonal recommendations
export const plantCategoryEnum = pgEnum("plant_category", [
  "tropical",
  "succulent",
  "flowering",
  "foliage",
  "herb",
  "vine",
  "tree",
  "fern",
  "cactus",
  "orchid"
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
  notes: text("notes"),
  
  // Images and status
  imageUrl: text("image_url"),
  status: plantStatusEnum("status").default("healthy"),
  
  // Plant category for seasonal recommendations
  category: plantCategoryEnum("category").default("foliage"),
  
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

// Types for TypeScript
export type WateringLog = typeof wateringLogs.$inferSelect;
export type InsertWateringLog = z.infer<typeof insertWateringLogSchema>;

export type FeedingLog = typeof feedingLogs.$inferSelect;
export type InsertFeedingLog = z.infer<typeof insertFeedingLogSchema>;

// -------------------- Seasonal Care Recommendations --------------------

// Season enum for recommendations
export const seasonEnum = pgEnum("season", [
  "spring",
  "summer",
  "fall",
  "winter"
]);

// Recommendation types
export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "watering",
  "fertilizing",
  "lighting",
  "humidity",
  "temperature",
  "repotting",
  "pruning",
  "pest_control",
  "general_care"
]);

// Seasonal care recommendations table
export const seasonalRecommendations = pgTable("seasonal_recommendations", {
  id: serial("id").primaryKey(),
  season: seasonEnum("season").notNull(),
  plantCategory: plantCategoryEnum("plant_category").notNull(),
  recommendationType: recommendationTypeEnum("recommendation_type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  frequency: varchar("frequency", { length: 100 }), // e.g., "weekly", "bi-weekly", "monthly"
  priority: integer("priority").default(1), // 1=low, 2=medium, 3=high
  isActive: integer("is_active").default(1), // 0=inactive, 1=active
  createdAt: timestamp("created_at").defaultNow(),
});

// User's plant recommendations (personalized based on their plants)
export const plantRecommendations = pgTable("plant_recommendations", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id, { onDelete: 'cascade' }),
  seasonalRecommendationId: integer("seasonal_recommendation_id").notNull().references(() => seasonalRecommendations.id),
  isCompleted: integer("is_completed").default(0), // 0=pending, 1=completed
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertSeasonalRecommendationSchema = createInsertSchema(seasonalRecommendations, {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  frequency: z.string().optional(),
  priority: z.number().min(1).max(3).optional(),
  isActive: z.number().min(0).max(1).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertPlantRecommendationSchema = createInsertSchema(plantRecommendations, {
  completedAt: z.union([z.string(), z.date(), z.null()]).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  notes: z.string().optional(),
  isCompleted: z.number().min(0).max(1).optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Types
export type SeasonalRecommendation = typeof seasonalRecommendations.$inferSelect;
export type InsertSeasonalRecommendation = z.infer<typeof insertSeasonalRecommendationSchema>;

export type PlantRecommendation = typeof plantRecommendations.$inferSelect;
export type InsertPlantRecommendation = z.infer<typeof insertPlantRecommendationSchema>;

// Season and category constants for easy reference
export const Season = {
  SPRING: "spring" as const,
  SUMMER: "summer" as const,
  FALL: "fall" as const,
  WINTER: "winter" as const
} as const;

export const PlantCategory = {
  TROPICAL: "tropical" as const,
  SUCCULENT: "succulent" as const,
  FLOWERING: "flowering" as const,
  FOLIAGE: "foliage" as const,
  HERB: "herb" as const,
  VINE: "vine" as const,
  TREE: "tree" as const,
  FERN: "fern" as const,
  CACTUS: "cactus" as const,
  ORCHID: "orchid" as const
} as const;

export const RecommendationType = {
  WATERING: "watering" as const,
  FERTILIZING: "fertilizing" as const,
  LIGHTING: "lighting" as const,
  HUMIDITY: "humidity" as const,
  TEMPERATURE: "temperature" as const,
  REPOTTING: "repotting" as const,
  PRUNING: "pruning" as const,
  PEST_CONTROL: "pest_control" as const,
  GENERAL_CARE: "general_care" as const
} as const;
