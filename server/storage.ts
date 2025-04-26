import { 
  users, type User, type InsertUser,
  plants, type Plant, type InsertPlant 
} from "@shared/schema";
import { db } from "./db";
import { eq, max, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Plant methods
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;
  getNextPlantNumber(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPlants(): Promise<Plant[]> {
    return db.select().from(plants).orderBy(desc(plants.createdAt));
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async getNextPlantNumber(): Promise<number> {
    const [result] = await db.select({ maxNum: max(plants.plantNumber) }).from(plants);
    return (result?.maxNum || 0) + 1;
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
    const [deletedPlant] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning({ id: plants.id });
    
    return !!deletedPlant;
  }
}

export const storage = new DatabaseStorage();
