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
