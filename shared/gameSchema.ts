import { pgTable, serial, text, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define property types
export const propertyTypeEnum = pgEnum('property_type', [
  'apartment_rental',
  'owned_condo',
  'small_house',
  'large_house',
  'luxury_mansion'
]);

// Define virtual plant rarity
export const plantRarityEnum = pgEnum('plant_rarity', [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
]);

// Define player table
export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletAddress: text("wallet_address"),
  tokenBalance: integer("token_balance").default(100), // Start with 100 tokens
  propertyType: propertyTypeEnum("property_type").default('apartment_rental'),
  propertyLevel: integer("property_level").default(1),
  maxPlants: integer("max_plants").default(5), // Start with space for 5 plants
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define virtual plants table
export const virtualPlants = pgTable("virtual_plants", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => gamePlayers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  plantType: text("plant_type").notNull(),
  rarity: plantRarityEnum("rarity").default('common'),
  health: integer("health").default(100),
  growthStage: integer("growth_stage").default(1),
  lastWatered: timestamp("last_watered").defaultNow(),
  lastFed: timestamp("last_fed").defaultNow(),
  tokenValue: integer("token_value").notNull(),
  isNFT: boolean("is_nft").default(false),
  nftTokenId: text("nft_token_id"),
  attributes: jsonb("attributes").default({}),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define marketplace listings
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => virtualPlants.id, { onDelete: "cascade" }),
  sellerId: integer("seller_id").notNull().references(() => gamePlayers.id),
  price: integer("price").notNull(),
  listedAt: timestamp("listed_at").defaultNow(),
  active: boolean("active").default(true),
  soldAt: timestamp("sold_at"),
  buyerId: integer("buyer_id").references(() => gamePlayers.id),
});

// Define property upgrades
export const propertyUpgrades = pgTable("property_upgrades", {
  id: serial("id").primaryKey(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  level: integer("level").notNull(),
  cost: integer("cost").notNull(),
  maxPlants: integer("max_plants").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// Define achievement types
export const achievementTypeEnum = pgEnum('achievement_type', [
  'plant_collection',
  'plant_care',
  'property_upgrade',
  'marketplace',
  'special'
]);

// Define achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: achievementTypeEnum("type").notNull(),
  requirement: jsonb("requirement").notNull(),
  rewardTokens: integer("reward_tokens").default(0),
  imageUrl: text("image_url"),
});

// Define player achievements
export const playerAchievements = pgTable("player_achievements", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => gamePlayers.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  rewardClaimed: boolean("reward_claimed").default(false),
});

// Schema for insert operations
export const insertGamePlayerSchema = createInsertSchema(gamePlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVirtualPlantSchema = createInsertSchema(virtualPlants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  listedAt: true,
  soldAt: true,
});

// Types for TypeScript
import { users } from "./schema";
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;

export type VirtualPlant = typeof virtualPlants.$inferSelect;
export type InsertVirtualPlant = z.infer<typeof insertVirtualPlantSchema>;

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;

export type PropertyUpgrade = typeof propertyUpgrades.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type PlayerAchievement = typeof playerAchievements.$inferSelect;