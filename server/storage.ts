import { 
  users, 
  plants, 
  customLocations, 
  wateringLogs,
  feedingLogs,
  seasonalRecommendations,
  plantRecommendations,
  PlantStatus,
  Season,
  PlantCategory,
  RecommendationType,
  type User, 
  type InsertUser, 
  type Plant, 
  type InsertPlant,
  type CustomLocation,
  type InsertCustomLocation,
  type WateringLog,
  type InsertWateringLog,
  type FeedingLog,
  type InsertFeedingLog,
  type SeasonalRecommendation,
  type InsertSeasonalRecommendation,
  type PlantRecommendation,
  type InsertPlantRecommendation
} from "@shared/schema";
import { db, runMigrations } from "./db";
import { eq, max, desc, sql, and, like, asc } from "drizzle-orm";

// Helper function for OR conditions in SQL queries
function or(...conditions: any[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getFeedingLogs(plantId: number): Promise<FeedingLog[]>;
  addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog>;
  
  // Seasonal recommendation methods
  getSeasonalRecommendations(season: string, category?: string): Promise<SeasonalRecommendation[]>;
  createSeasonalRecommendation(recommendation: InsertSeasonalRecommendation): Promise<SeasonalRecommendation>;
  getPlantRecommendations(plantId: number, includeCompleted?: boolean): Promise<PlantRecommendation[]>;
  getUserPlantRecommendations(includeCompleted?: boolean): Promise<(PlantRecommendation & { plant: Plant; seasonalRecommendation: SeasonalRecommendation })[]>;
  createPlantRecommendation(recommendation: InsertPlantRecommendation): Promise<PlantRecommendation>;
  markRecommendationCompleted(recommendationId: number, notes?: string): Promise<boolean>;
  generateSeasonalRecommendationsForUser(): Promise<PlantRecommendation[]>;
  
  // Database initialization
  initialize(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Initialize database and run migrations
  async initialize(): Promise<void> {
    try {
      await runMigrations();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  // -------------------- User Methods --------------------
  
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

  // -------------------- Seasonal Recommendation Methods --------------------

  async getSeasonalRecommendations(season: string, category?: string): Promise<SeasonalRecommendation[]> {
    let whereConditions = [
      eq(seasonalRecommendations.season, season as any),
      eq(seasonalRecommendations.isActive, 1)
    ];

    if (category) {
      whereConditions.push(eq(seasonalRecommendations.plantCategory, category as any));
    }

    return db.select()
      .from(seasonalRecommendations)
      .where(and(...whereConditions))
      .orderBy(desc(seasonalRecommendations.priority), asc(seasonalRecommendations.title));
  }

  async createSeasonalRecommendation(recommendation: InsertSeasonalRecommendation): Promise<SeasonalRecommendation> {
    const [newRecommendation] = await db
      .insert(seasonalRecommendations)
      .values(recommendation)
      .returning();
    
    return newRecommendation;
  }

  async getPlantRecommendations(plantId: number, includeCompleted = false): Promise<PlantRecommendation[]> {
    let whereConditions = [eq(plantRecommendations.plantId, plantId)];

    if (!includeCompleted) {
      whereConditions.push(eq(plantRecommendations.isCompleted, 0));
    }

    return db.select()
      .from(plantRecommendations)
      .where(and(...whereConditions))
      .orderBy(desc(plantRecommendations.createdAt));
  }

  async getUserPlantRecommendations(includeCompleted = false): Promise<(PlantRecommendation & { plant: Plant; seasonalRecommendation: SeasonalRecommendation })[]> {
    let query = db.select({
      id: plantRecommendations.id,
      plantId: plantRecommendations.plantId,
      seasonalRecommendationId: plantRecommendations.seasonalRecommendationId,
      isCompleted: plantRecommendations.isCompleted,
      completedAt: plantRecommendations.completedAt,
      dueDate: plantRecommendations.dueDate,
      notes: plantRecommendations.notes,
      createdAt: plantRecommendations.createdAt,
      plant: plants,
      seasonalRecommendation: seasonalRecommendations
    })
      .from(plantRecommendations)
      .innerJoin(plants, eq(plantRecommendations.plantId, plants.id))
      .innerJoin(seasonalRecommendations, eq(plantRecommendations.seasonalRecommendationId, seasonalRecommendations.id));

    if (!includeCompleted) {
      query = query.where(eq(plantRecommendations.isCompleted, 0));
    }

    return query.orderBy(desc(seasonalRecommendations.priority), asc(plantRecommendations.dueDate));
  }

  async createPlantRecommendation(recommendation: InsertPlantRecommendation): Promise<PlantRecommendation> {
    // Convert string dates to Date objects
    const processedRecommendation: any = { ...recommendation };
    
    if (processedRecommendation.dueDate && typeof processedRecommendation.dueDate === 'string') {
      processedRecommendation.dueDate = new Date(processedRecommendation.dueDate);
    }
    if (processedRecommendation.completedAt && typeof processedRecommendation.completedAt === 'string') {
      processedRecommendation.completedAt = new Date(processedRecommendation.completedAt);
    }

    const [newRecommendation] = await db
      .insert(plantRecommendations)
      .values(processedRecommendation)
      .returning();
    
    return newRecommendation;
  }

  async markRecommendationCompleted(recommendationId: number, notes?: string): Promise<boolean> {
    const updatedRecommendation = await db
      .update(plantRecommendations)
      .set({
        isCompleted: 1,
        completedAt: new Date(),
        notes: notes || null
      })
      .where(eq(plantRecommendations.id, recommendationId))
      .returning();

    return updatedRecommendation.length > 0;
  }

  async generateSeasonalRecommendationsForUser(): Promise<PlantRecommendation[]> {
    // Get current season
    const currentSeason = this.getCurrentSeason();
    
    // Get all user plants
    const userPlants = await this.getPlants();
    
    const newRecommendations: PlantRecommendation[] = [];

    for (const plant of userPlants) {
      // Get seasonal recommendations for this plant's category
      const seasonalRecs = await this.getSeasonalRecommendations(currentSeason, plant.category || undefined);
      
      for (const seasonalRec of seasonalRecs) {
        // Check if this recommendation already exists for this plant
        const existingRecs = await db.select()
          .from(plantRecommendations)
          .where(and(
            eq(plantRecommendations.plantId, plant.id),
            eq(plantRecommendations.seasonalRecommendationId, seasonalRec.id),
            eq(plantRecommendations.isCompleted, 0)
          ));

        if (existingRecs.length === 0) {
          // Create new plant recommendation
          const dueDate = this.calculateDueDate(seasonalRec.frequency);
          
          const newRec = await this.createPlantRecommendation({
            plantId: plant.id,
            seasonalRecommendationId: seasonalRec.id,
            dueDate,
            isCompleted: 0
          });
          
          newRecommendations.push(newRec);
        }
      }
    }

    return newRecommendations;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 3 && month <= 5) return Season.SPRING;
    if (month >= 6 && month <= 8) return Season.SUMMER;
    if (month >= 9 && month <= 11) return Season.FALL;
    return Season.WINTER;
  }

  private calculateDueDate(frequency?: string | null): Date {
    const now = new Date();
    
    switch (frequency?.toLowerCase()) {
      case 'daily':
        return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'bi-weekly':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to weekly
    }
  }
}

export const storage = new DatabaseStorage();