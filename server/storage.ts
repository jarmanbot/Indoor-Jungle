import { 
  users, 
  plants, 
  customLocations, 
  wateringLogs,
  feedingLogs,
  repottingLogs,
  soilTopUpLogs,
  pruningLogs,
  PlantStatus,
  type User, 
  type UpsertUser, 
  type Plant, 
  type InsertPlant,
  type CustomLocation,
  type InsertCustomLocation,
  type WateringLog,
  type InsertWateringLog,
  type FeedingLog,
  type InsertFeedingLog,
  type RepottingLog,
  type InsertRepottingLog,
  type SoilTopUpLog,
  type InsertSoilTopUpLog,
  type PruningLog,
  type InsertPruningLog
} from "@shared/schema";
import { db, testConnection } from "./db";
import { eq, max, desc, sql, and, like, asc } from "drizzle-orm";

// Helper function for OR conditions in SQL queries
function or(...conditions: any[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}

export interface IStorage {
  // User methods
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Plant methods
  getPlants(): Promise<Plant[]>;
  searchPlants(query: string): Promise<Plant[]>;
  getPlantsByLocation(location: string): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;
  getNextPlantNumber(): Promise<number>;
  
  // Location methods
  getCustomLocations(): Promise<CustomLocation[]>;
  createCustomLocation(location: InsertCustomLocation): Promise<CustomLocation>;
  deleteCustomLocation(id: number): Promise<boolean>;
  
  // Plant care log methods
  getWateringLogs(plantId: number): Promise<WateringLog[]>;
  addWateringLog(log: InsertWateringLog): Promise<WateringLog>;
  deleteWateringLog(id: number): Promise<boolean>;
  getFeedingLogs(plantId: number): Promise<FeedingLog[]>;
  addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog>;
  deleteFeedingLog(id: number): Promise<boolean>;
  getRepottingLogs(plantId: number): Promise<RepottingLog[]>;
  addRepottingLog(log: InsertRepottingLog): Promise<RepottingLog>;
  deleteRepottingLog(id: number): Promise<boolean>;
  getSoilTopUpLogs(plantId: number): Promise<SoilTopUpLog[]>;
  addSoilTopUpLog(log: InsertSoilTopUpLog): Promise<SoilTopUpLog>;
  deleteSoilTopUpLog(id: number): Promise<boolean>;
  getPruningLogs(plantId: number): Promise<PruningLog[]>;
  addPruningLog(log: InsertPruningLog): Promise<PruningLog>;
  deletePruningLog(id: number): Promise<boolean>;
  
  // Database initialization
  initialize(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Initialize database and test connection
  async initialize(): Promise<void> {
    try {
      await testConnection();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  // -------------------- User Methods --------------------
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // -------------------- Plant Methods --------------------
  
  async getPlants(): Promise<Plant[]> {
    return db.select().from(plants).orderBy(asc(plants.plantNumber));
  }
  
  async searchPlants(query: string): Promise<Plant[]> {
    if (!query || query.trim() === '') {
      return this.getPlants();
    }
    
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return db.select()
      .from(plants)
      .where(
        or(
          like(sql`lower(${plants.babyName})`, searchTerm),
          like(sql`lower(${plants.commonName})`, searchTerm),
          like(sql`lower(${plants.latinName})`, searchTerm),
          like(sql`lower(${plants.notes})`, searchTerm)
        )
      )
      .orderBy(desc(plants.createdAt));
  }
  
  async getPlantsByLocation(location: string): Promise<Plant[]> {
    return db.select()
      .from(plants)
      .where(eq(plants.location, location))
      .orderBy(asc(plants.plantNumber));
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async getNextPlantNumber(): Promise<number> {
    // Get all plants ordered by their current number
    const allPlants = await db.select().from(plants).orderBy(plants.plantNumber);
    
    // If there are no plants yet, start with 1
    if (allPlants.length === 0) {
      return 1;
    }

    // Find the first available number
    // Start with 1 and check if it's in use
    let numberToUse = 1;
    const usedNumbers = allPlants.map(plant => plant.plantNumber);
    
    // Find the smallest positive integer that's not in usedNumbers
    while (usedNumbers.includes(numberToUse)) {
      numberToUse++;
    }
    
    // Return the first available number
    return numberToUse;
  }
  
  // -------------------- Location Methods --------------------
  
  async getCustomLocations(): Promise<CustomLocation[]> {
    return db.select()
      .from(customLocations)
      .orderBy(asc(customLocations.name));
  }
  
  async createCustomLocation(location: InsertCustomLocation): Promise<CustomLocation> {
    try {
      // Check if this location already exists
      const [existing] = await db.select()
        .from(customLocations)
        .where(eq(customLocations.name, location.name));
        
      if (existing) {
        return existing;
      }
      
      // Create new location
      const [newLocation] = await db.insert(customLocations)
        .values(location)
        .returning();
        
      return newLocation;
    } catch (error) {
      console.error("Error creating custom location:", error);
      throw error;
    }
  }
  
  async deleteCustomLocation(id: number): Promise<boolean> {
    const result = await db.delete(customLocations)
      .where(eq(customLocations.id, id))
      .returning();
      
    return result.length > 0;
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    // Get the next plant number
    const nextPlantNumber = await this.getNextPlantNumber();
    
    // Convert string dates to Date objects
    const processedData: any = { ...insertPlant };
    
    // Process date fields
    if (processedData.lastWatered && typeof processedData.lastWatered === 'string') {
      processedData.lastWatered = new Date(processedData.lastWatered);
    }
    
    if (processedData.nextCheck && typeof processedData.nextCheck === 'string') {
      processedData.nextCheck = new Date(processedData.nextCheck);
    }
    
    if (processedData.lastFed && typeof processedData.lastFed === 'string') {
      processedData.lastFed = new Date(processedData.lastFed);
    }
    
    // Ensure name field is set for backward compatibility
    const plantData = {
      ...processedData,
      plantNumber: nextPlantNumber,
      // If name is missing, use babyName as the value for the name field
      name: processedData.name || processedData.babyName
    };
    
    const [plant] = await db
      .insert(plants)
      .values(plantData)
      .returning();
    return plant;
  }

  async updatePlant(id: number, updates: Partial<InsertPlant>): Promise<Plant | undefined> {
    // If babyName is updated, also update name for backward compatibility
    const processedUpdates: any = { ...updates };
    
    // Convert string dates to Date objects
    if (processedUpdates.lastWatered && typeof processedUpdates.lastWatered === 'string') {
      processedUpdates.lastWatered = new Date(processedUpdates.lastWatered);
    }
    
    if (processedUpdates.nextCheck && typeof processedUpdates.nextCheck === 'string') {
      processedUpdates.nextCheck = new Date(processedUpdates.nextCheck);
    }
    
    if (processedUpdates.lastFed && typeof processedUpdates.lastFed === 'string') {
      processedUpdates.lastFed = new Date(processedUpdates.lastFed);
    }
    
    // Set name for backward compatibility
    if (processedUpdates.babyName) {
      processedUpdates.name = processedUpdates.babyName;
    }
    
    const [updatedPlant] = await db
      .update(plants)
      .set(processedUpdates)
      .where(eq(plants.id, id))
      .returning();
    return updatedPlant || undefined;
  }

  async deletePlant(id: number): Promise<boolean> {
    // Delete the plant without renumbering others
    const [deletedPlant] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning({ id: plants.id });
    
    // Plant numbers stay as they were - no renumbering
    
    return !!deletedPlant;
  }

  // -------------------- Plant Care Log Methods --------------------

  async getWateringLogs(plantId: number): Promise<WateringLog[]> {
    return db.select()
      .from(wateringLogs)
      .where(eq(wateringLogs.plantId, plantId))
      .orderBy(desc(wateringLogs.wateredAt));
  }

  async addWateringLog(log: InsertWateringLog): Promise<WateringLog> {
    // Convert string dates to Date objects
    const processedLog: any = { ...log };
    
    if (processedLog.wateredAt && typeof processedLog.wateredAt === 'string') {
      processedLog.wateredAt = new Date(processedLog.wateredAt);
    }

    const [newLog] = await db
      .insert(wateringLogs)
      .values(processedLog)
      .returning();
    
    // Update the plant's lastWatered timestamp
    await db
      .update(plants)
      .set({
        lastWatered: newLog.wateredAt,
        // Calculate next check date (add 7 days by default, can be adjusted based on plant type)
        nextCheck: new Date(newLog.wateredAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        // Update status to healthy when watered
        status: PlantStatus.HEALTHY
      })
      .where(eq(plants.id, log.plantId));
    
    return newLog;
  }

  async getFeedingLogs(plantId: number): Promise<FeedingLog[]> {
    return db.select()
      .from(feedingLogs)
      .where(eq(feedingLogs.plantId, plantId))
      .orderBy(desc(feedingLogs.fedAt));
  }

  async addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog> {
    // Convert string dates to Date objects
    const processedLog: any = { ...log };
    
    if (processedLog.fedAt && typeof processedLog.fedAt === 'string') {
      processedLog.fedAt = new Date(processedLog.fedAt);
    }

    const [newLog] = await db
      .insert(feedingLogs)
      .values(processedLog)
      .returning();
    
    // Update the plant's lastFed timestamp
    await db
      .update(plants)
      .set({
        lastFed: newLog.fedAt,
      })
      .where(eq(plants.id, log.plantId));
    
    return newLog;
  }

  async deleteWateringLog(id: number): Promise<boolean> {
    const [deletedLog] = await db
      .delete(wateringLogs)
      .where(eq(wateringLogs.id, id))
      .returning();
    return !!deletedLog;
  }

  async deleteFeedingLog(id: number): Promise<boolean> {
    const [deletedLog] = await db
      .delete(feedingLogs)
      .where(eq(feedingLogs.id, id))
      .returning();
    return !!deletedLog;
  }

  // -------------------- Repotting Log Methods --------------------

  async getRepottingLogs(plantId: number): Promise<RepottingLog[]> {
    return db.select()
      .from(repottingLogs)
      .where(eq(repottingLogs.plantId, plantId))
      .orderBy(desc(repottingLogs.repottedAt));
  }

  async addRepottingLog(log: InsertRepottingLog): Promise<RepottingLog> {
    const processedLog: any = { ...log };
    
    if (processedLog.repottedAt && typeof processedLog.repottedAt === 'string') {
      processedLog.repottedAt = new Date(processedLog.repottedAt);
    }

    const [newLog] = await db
      .insert(repottingLogs)
      .values(processedLog)
      .returning();
    
    return newLog;
  }

  async deleteRepottingLog(id: number): Promise<boolean> {
    const [deletedLog] = await db
      .delete(repottingLogs)
      .where(eq(repottingLogs.id, id))
      .returning();
    return !!deletedLog;
  }

  // -------------------- Soil Top Up Log Methods --------------------

  async getSoilTopUpLogs(plantId: number): Promise<SoilTopUpLog[]> {
    return db.select()
      .from(soilTopUpLogs)
      .where(eq(soilTopUpLogs.plantId, plantId))
      .orderBy(desc(soilTopUpLogs.toppedUpAt));
  }

  async addSoilTopUpLog(log: InsertSoilTopUpLog): Promise<SoilTopUpLog> {
    const processedLog: any = { ...log };
    
    if (processedLog.toppedUpAt && typeof processedLog.toppedUpAt === 'string') {
      processedLog.toppedUpAt = new Date(processedLog.toppedUpAt);
    }

    const [newLog] = await db
      .insert(soilTopUpLogs)
      .values(processedLog)
      .returning();
    
    return newLog;
  }

  async deleteSoilTopUpLog(id: number): Promise<boolean> {
    const [deletedLog] = await db
      .delete(soilTopUpLogs)
      .where(eq(soilTopUpLogs.id, id))
      .returning();
    return !!deletedLog;
  }

  // -------------------- Pruning Log Methods --------------------

  async getPruningLogs(plantId: number): Promise<PruningLog[]> {
    return db.select()
      .from(pruningLogs)
      .where(eq(pruningLogs.plantId, plantId))
      .orderBy(desc(pruningLogs.prunedAt));
  }

  async addPruningLog(log: InsertPruningLog): Promise<PruningLog> {
    const processedLog: any = { ...log };
    
    if (processedLog.prunedAt && typeof processedLog.prunedAt === 'string') {
      processedLog.prunedAt = new Date(processedLog.prunedAt);
    }

    const [newLog] = await db
      .insert(pruningLogs)
      .values(processedLog)
      .returning();
    
    return newLog;
  }

  async deletePruningLog(id: number): Promise<boolean> {
    const [deletedLog] = await db
      .delete(pruningLogs)
      .where(eq(pruningLogs.id, id))
      .returning();
    return !!deletedLog;
  }
}

export const storage = new DatabaseStorage();