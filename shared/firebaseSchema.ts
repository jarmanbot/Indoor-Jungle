import { z } from "zod";

// Plant schema for Firebase (uses string IDs)
export const firebasePlantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Plant name is required"),
  userId: z.string(),
  plantNumber: z.number().int().positive(),
  babyName: z.string().optional().default(""),
  commonName: z.string().optional().default(""),
  latinName: z.string().optional().nullable().default(null),
  location: z.string().default("living_room"),
  lastWatered: z.date().nullable().default(null),
  nextCheck: z.date().nullable().default(null),
  lastFed: z.date().nullable().default(null),
  wateringFrequencyDays: z.number().int().positive().default(7),
  feedingFrequencyDays: z.number().int().positive().default(14),
  notes: z.string().nullable().default(null),
  imageUrl: z.string().nullable().default(null),
  status: z.enum(["healthy", "needs_attention", "sick", "recovering"]).nullable().default("healthy"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertFirebasePlantSchema = firebasePlantSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  plantNumber: true 
});

export type FirebasePlant = z.infer<typeof firebasePlantSchema>;
export type InsertFirebasePlant = z.infer<typeof insertFirebasePlantSchema>;

// Care log schemas for Firebase
export const firebaseCareLogSchema = z.object({
  id: z.string(),
  plantId: z.string(),
  userId: z.string(),
  date: z.date(),
  notes: z.string().nullable().default(null),
  createdAt: z.date(),
});

export const insertFirebaseCareLogSchema = firebaseCareLogSchema.omit({
  id: true,
  createdAt: true,
});

export type FirebaseCareLog = z.infer<typeof firebaseCareLogSchema>;
export type InsertFirebaseCareLog = z.infer<typeof insertFirebaseCareLogSchema>;

// User schema for Firebase
export const firebaseUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const upsertFirebaseUserSchema = firebaseUserSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type FirebaseUser = z.infer<typeof firebaseUserSchema>;
export type UpsertFirebaseUser = z.infer<typeof upsertFirebaseUserSchema>;