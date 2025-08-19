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
import { mockFirebaseStorage } from "./mockFirebaseStorage";

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
  getWateringLogs(plantId: string): Promise<WateringLog[]>;
  addWateringLog(log: InsertWateringLog): Promise<WateringLog>;
  deleteWateringLog(id: string): Promise<boolean>;
  getFeedingLogs(plantId: string): Promise<FeedingLog[]>;
  addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog>;
  deleteFeedingLog(id: string): Promise<boolean>;
  getRepottingLogs(plantId: string): Promise<RepottingLog[]>;
  addRepottingLog(log: InsertRepottingLog): Promise<RepottingLog>;
  deleteRepottingLog(id: string): Promise<boolean>;
  getSoilTopUpLogs(plantId: string): Promise<SoilTopUpLog[]>;
  addSoilTopUpLog(log: InsertSoilTopUpLog): Promise<SoilTopUpLog>;
  deleteSoilTopUpLog(id: string): Promise<boolean>;
  getPruningLogs(plantId: string): Promise<PruningLog[]>;
  addPruningLog(log: InsertPruningLog): Promise<PruningLog>;
  deletePruningLog(id: string): Promise<boolean>;
  
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
    // First delete all associated care logs for this plant
    await db.delete(wateringLogs).where(eq(wateringLogs.plantId, id));
    await db.delete(feedingLogs).where(eq(feedingLogs.plantId, id));
    await db.delete(repottingLogs).where(eq(repottingLogs.plantId, id));
    await db.delete(soilTopUpLogs).where(eq(soilTopUpLogs.plantId, id));
    await db.delete(pruningLogs).where(eq(pruningLogs.plantId, id));
    
    // Then delete the plant itself
    const [deletedPlant] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning({ id: plants.id });
    
    console.log(`Deleted plant ID ${id} and all associated care logs`);
    return !!deletedPlant;
  }

  // -------------------- Plant Care Log Methods --------------------

  async getWateringLogs(plantId: string): Promise<WateringLog[]> {
    const logs = await mockFirebaseStorage.getCareLogsForPlant('dev-user', plantId, 'wateringLogs');
    return logs.map(log => ({
      id: log.id,
      plantId: log.plantId,
      wateredAt: log.wateredAt || new Date(),
      amount: log.amount || null,
      notes: log.notes || null,
      createdAt: log.createdAt
    })) as WateringLog[];
  }

  async addWateringLog(log: InsertWateringLog): Promise<WateringLog> {
    const newLog = await mockFirebaseStorage.addCareLog('dev-user', 'wateringLogs', log);
    return {
      id: newLog.id,
      plantId: newLog.plantId,
      wateredAt: newLog.wateredAt || new Date(),
      amount: newLog.amount || null,
      notes: newLog.notes || null,
      createdAt: newLog.createdAt
    } as WateringLog;
  }

  async getFeedingLogs(plantId: string): Promise<FeedingLog[]> {
    const logs = await mockFirebaseStorage.getCareLogsForPlant('dev-user', plantId, 'feedingLogs');
    return logs.map(log => ({
      id: log.id,
      plantId: log.plantId,
      fedAt: log.fedAt || new Date(),
      fertilizer: log.fertilizer || null,
      amount: log.amount || null,
      notes: log.notes || null,
      createdAt: log.createdAt
    })) as FeedingLog[];
  }

  async addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog> {
    const newLog = await mockFirebaseStorage.addCareLog('dev-user', 'feedingLogs', log);
    return {
      id: newLog.id,
      plantId: newLog.plantId,
      fedAt: newLog.fedAt || new Date(),
      fertilizer: newLog.fertilizer || null,
      amount: newLog.amount || null,
      notes: newLog.notes || null,
      createdAt: newLog.createdAt
    } as FeedingLog;
  }

  async deleteWateringLog(id: string): Promise<boolean> {
    // For now, just return true as the mock storage doesn't have a delete method
    return true;
  }

  async deleteFeedingLog(id: string): Promise<boolean> {
    // For now, just return true as the mock storage doesn't have a delete method
    return true;
  }

  // -------------------- Repotting Log Methods --------------------

  async getRepottingLogs(plantId: string): Promise<RepottingLog[]> {
    const logs = await mockFirebaseStorage.getCareLogsForPlant('dev-user', plantId, 'repottingLogs');
    return logs.map(log => ({
      id: log.id,
      plantId: log.plantId,
      repottedAt: log.repottedAt || new Date(),
      potSize: log.potSize || null,
      soilType: log.soilType || null,
      notes: log.notes || null,
      createdAt: log.createdAt
    })) as RepottingLog[];
  }

  async addRepottingLog(log: InsertRepottingLog): Promise<RepottingLog> {
    const newLog = await mockFirebaseStorage.addCareLog('dev-user', 'repottingLogs', log);
    return {
      id: newLog.id,
      plantId: newLog.plantId,
      repottedAt: newLog.repottedAt || new Date(),
      potSize: newLog.potSize || null,
      soilType: newLog.soilType || null,
      notes: newLog.notes || null,
      createdAt: newLog.createdAt
    } as RepottingLog;
  }

  async deleteRepottingLog(id: string): Promise<boolean> {
    // For now, just return true as the mock storage doesn't have a delete method
    return true;
  }

  // -------------------- Soil Top Up Log Methods --------------------

  async getSoilTopUpLogs(plantId: string): Promise<SoilTopUpLog[]> {
    const logs = await mockFirebaseStorage.getCareLogsForPlant('dev-user', plantId, 'soilTopUpLogs');
    return logs.map(log => ({
      id: log.id,
      plantId: log.plantId,
      toppedUpAt: log.toppedUpAt || new Date(),
      soilType: log.soilType || null,
      amount: log.amount || null,
      notes: log.notes || null,
      createdAt: log.createdAt
    })) as SoilTopUpLog[];
  }

  async addSoilTopUpLog(log: InsertSoilTopUpLog): Promise<SoilTopUpLog> {
    const newLog = await mockFirebaseStorage.addCareLog('dev-user', 'soilTopUpLogs', log);
    return {
      id: newLog.id,
      plantId: newLog.plantId,
      toppedUpAt: newLog.toppedUpAt || new Date(),
      soilType: newLog.soilType || null,
      amount: newLog.amount || null,
      notes: newLog.notes || null,
      createdAt: newLog.createdAt
    } as SoilTopUpLog;
  }

  async deleteSoilTopUpLog(id: string): Promise<boolean> {
    // For now, just return true as the mock storage doesn't have a delete method
    return true;
  }

  // -------------------- Pruning Log Methods --------------------

  async getPruningLogs(plantId: string): Promise<PruningLog[]> {
    const logs = await mockFirebaseStorage.getCareLogsForPlant('dev-user', plantId, 'pruningLogs');
    return logs.map(log => ({
      id: log.id,
      plantId: log.plantId,
      prunedAt: log.prunedAt || new Date(),
      partsRemoved: log.partsRemoved || null,
      reason: log.reason || null,
      notes: log.notes || null,
      createdAt: log.createdAt
    })) as PruningLog[];
  }

  async addPruningLog(log: InsertPruningLog): Promise<PruningLog> {
    const newLog = await mockFirebaseStorage.addCareLog('dev-user', 'pruningLogs', log);
    return {
      id: newLog.id,
      plantId: newLog.plantId,
      prunedAt: newLog.prunedAt || new Date(),
      partsRemoved: newLog.partsRemoved || null,
      reason: newLog.reason || null,
      notes: newLog.notes || null,
      createdAt: newLog.createdAt
    } as PruningLog;
  }

  async deletePruningLog(id: string): Promise<boolean> {
    // For now, just return true as the mock storage doesn't have a delete method
    return true;
  }
}

export const storage = new DatabaseStorage();