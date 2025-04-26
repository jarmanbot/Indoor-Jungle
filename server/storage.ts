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
    
    // Ensure name field is set for backward compatibility
    const plantData = {
      ...insertPlant,
      plantNumber: nextPlantNumber,
      // If name is missing, use babyName as the value for the name field
      name: insertPlant.name || insertPlant.babyName
    };
    
    const [plant] = await db
      .insert(plants)
      .values(plantData)
      .returning();
    return plant;
  }

  async updatePlant(id: number, updates: Partial<InsertPlant>): Promise<Plant | undefined> {
    // If babyName is updated, also update name for backward compatibility
    const updatedValues = { ...updates };
    if (updates.babyName) {
      updatedValues.name = updates.babyName;
    }
    
    const [updatedPlant] = await db
      .update(plants)
      .set(updatedValues)
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
