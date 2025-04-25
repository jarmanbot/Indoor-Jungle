import { 
  users, type User, type InsertUser,
  plants, type Plant, type InsertPlant 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plants: Map<number, Plant>;
  private userCurrentId: number;
  private plantCurrentId: number;

  constructor() {
    this.users = new Map();
    this.plants = new Map();
    this.userCurrentId = 1;
    this.plantCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Plant methods
  async getPlants(): Promise<Plant[]> {
    return Array.from(this.plants.values());
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    return this.plants.get(id);
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = this.plantCurrentId++;
    const now = new Date();
    
    // Convert string dates to Date objects if they exist
    const lastWatered = insertPlant.lastWatered ? new Date(insertPlant.lastWatered) : undefined;
    const nextCheck = insertPlant.nextCheck ? new Date(insertPlant.nextCheck) : undefined;
    const lastFed = insertPlant.lastFed ? new Date(insertPlant.lastFed) : undefined;
    
    const plant: Plant = { 
      ...insertPlant, 
      id, 
      createdAt: now,
      lastWatered,
      nextCheck,
      lastFed
    };
    
    this.plants.set(id, plant);
    return plant;
  }

  async updatePlant(id: number, updates: Partial<InsertPlant>): Promise<Plant | undefined> {
    const plant = this.plants.get(id);
    
    if (!plant) return undefined;
    
    // Convert string dates to Date objects if they exist in updates
    if (typeof updates.lastWatered === 'string') {
      updates.lastWatered = new Date(updates.lastWatered);
    }
    if (typeof updates.nextCheck === 'string') {
      updates.nextCheck = new Date(updates.nextCheck);
    }
    if (typeof updates.lastFed === 'string') {
      updates.lastFed = new Date(updates.lastFed);
    }
    
    const updatedPlant: Plant = { ...plant, ...updates };
    this.plants.set(id, updatedPlant);
    
    return updatedPlant;
  }

  async deletePlant(id: number): Promise<boolean> {
    return this.plants.delete(id);
  }
}

export const storage = new MemStorage();
