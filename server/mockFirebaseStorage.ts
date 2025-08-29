// Mock Firebase storage service for testing Firebase API endpoints
// This simulates Firebase functionality without requiring full authentication

import fs from 'fs';
import path from 'path';

interface MockPlant {
  id: string;
  userId: string;
  name: string;
  babyName?: string;
  commonName?: string;
  latinName?: string;
  location: string;
  plantNumber?: number;
  lastWatered?: Date | null;
  lastFed?: Date | null;
  nextCheck?: Date | null;
  wateringFrequencyDays: number;
  feedingFrequencyDays: number;
  notes?: string;
  imageUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCareLog {
  id: string;
  userId: string;
  plantId: string;
  wateredAt?: Date;  // For watering logs
  fedAt?: Date;      // For feeding logs
  repottedAt?: Date; // For repotting logs
  toppedUpAt?: Date; // For soil top-up logs
  prunedAt?: Date;   // For pruning logs
  notes?: string;
  amount?: string;
  fertilizer?: string;
  potSize?: string;
  soilType?: string;
  partsRemoved?: string;
  reason?: string;
  createdAt: Date;
}

class MockFirebaseStorage {
  private plants: Map<string, MockPlant[]> = new Map();
  private careLogs: Map<string, MockCareLog[]> = new Map();
  private dataFile: string;

  constructor() {
    this.dataFile = path.join(process.cwd(), 'firebase_storage_data.json');
    this.loadDataFromFile();
  }

  // Load data from file on startup
  private loadDataFromFile(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        // Convert arrays back to Maps
        if (data.plants) {
          this.plants = new Map(Object.entries(data.plants));
        }
        if (data.careLogs) {
          this.careLogs = new Map(Object.entries(data.careLogs));
        }
        console.log('Mock Firebase: Loaded data from persistent storage');
      }
    } catch (error) {
      console.warn('Mock Firebase: Could not load data from file:', error);
    }
  }

  // Save data to file for persistence
  private saveDataToFile(): void {
    try {
      const data = {
        plants: Object.fromEntries(this.plants),
        careLogs: Object.fromEntries(this.careLogs)
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Mock Firebase: Could not save data to file:', error);
    }
  }

  // Get all plants for a user
  async getPlants(userId: string): Promise<MockPlant[]> {
    console.log(`Mock Firebase: Getting plants for user ${userId}`);
    const userPlants = this.plants.get(userId) || [];
    console.log(`Mock Firebase: Found ${userPlants.length} plants`);
    return userPlants;
  }

  // Get specific plant
  async getPlant(userId: string, plantId: string): Promise<MockPlant | null> {
    console.log(`Mock Firebase: Getting plant ${plantId} for user ${userId}`);
    const userPlants = this.plants.get(userId) || [];
    return userPlants.find(plant => plant.id === plantId) || null;
  }

  // Create new plant
  async createPlant(userId: string, plantData: any): Promise<MockPlant> {
    console.log(`Mock Firebase: Creating plant for user ${userId}:`, plantData);
    
    // Get current plants to find the next available plant number
    const currentPlants = this.plants.get(userId) || [];
    
    // Find the lowest available plant number (reuse deleted numbers)
    let nextPlantNumber = 1;
    const usedNumbers = new Set(currentPlants.map(p => p.plantNumber || 0).filter(n => n > 0));
    
    console.log(`Mock Firebase: Current used plant numbers:`, Array.from(usedNumbers).sort((a, b) => a - b));
    
    // Find the first gap in the sequence or use the next sequential number
    while (usedNumbers.has(nextPlantNumber)) {
      nextPlantNumber++;
    }
    
    console.log(`Mock Firebase: Assigning plant number ${nextPlantNumber} (reusing deleted numbers)`);
    
    const newPlant: MockPlant = {
      id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: plantData.name,
      babyName: plantData.babyName || '',
      commonName: plantData.commonName || '',
      latinName: plantData.latinName || '',
      location: plantData.location || 'living_room',
      plantNumber: nextPlantNumber,
      lastWatered: plantData.lastWatered ? new Date(plantData.lastWatered) : null,
      lastFed: plantData.lastFed ? new Date(plantData.lastFed) : null,
      nextCheck: plantData.nextCheck ? new Date(plantData.nextCheck) : null,
      wateringFrequencyDays: plantData.wateringFrequencyDays || 7,
      feedingFrequencyDays: plantData.feedingFrequencyDays || 14,
      notes: plantData.notes || '',
      imageUrl: plantData.imageUrl || null,
      status: plantData.status || 'healthy',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userPlants = this.plants.get(userId) || [];
    userPlants.push(newPlant);
    this.plants.set(userId, userPlants);
    this.saveDataToFile(); // Persist to file

    console.log(`Mock Firebase: Created plant with ID ${newPlant.id}`);
    return newPlant;
  }

  // Update plant
  async updatePlant(userId: string, plantId: string, updateData: any): Promise<MockPlant> {
    console.log(`Mock Firebase: Updating plant ${plantId} for user ${userId}`);
    
    const userPlants = this.plants.get(userId) || [];
    const plantIndex = userPlants.findIndex(plant => plant.id === plantId);
    
    if (plantIndex === -1) {
      throw new Error('Plant not found');
    }

    userPlants[plantIndex] = {
      ...userPlants[plantIndex],
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.plants.set(userId, userPlants);
    this.saveDataToFile(); // Persist to file
    return userPlants[plantIndex];
  }

  // Delete plant
  async deletePlant(userId: string, plantId: string): Promise<void> {
    console.log(`Mock Firebase: Deleting plant ${plantId} for user ${userId}`);
    
    const userPlants = this.plants.get(userId) || [];
    const filteredPlants = userPlants.filter(plant => plant.id !== plantId);
    this.plants.set(userId, filteredPlants);
    this.saveDataToFile(); // Persist to file
  }

  // Get care logs for a plant
  async getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<MockCareLog[]> {
    console.log(`Mock Firebase: Getting ${logType} for plant ${plantId}, user ${userId}`);
    const userLogs = this.careLogs.get(`${userId}_${logType}`) || [];
    return userLogs.filter(log => log.plantId === plantId);
  }

  // Add care log
  async addCareLog(userId: string, logType: string, logData: any): Promise<MockCareLog> {
    console.log(`Mock Firebase: Adding ${logType} log for user ${userId}`);
    
    const newLog: MockCareLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      plantId: logData.plantId,
      notes: logData.notes || '',
      createdAt: new Date(),
    };

    // Map the correct date field based on log type
    const now = new Date();
    switch (logType) {
      case 'wateringLogs':
        newLog.wateredAt = logData.wateredAt ? new Date(logData.wateredAt) : now;
        newLog.amount = logData.amount;
        break;
      case 'feedingLogs':
        newLog.fedAt = logData.fedAt ? new Date(logData.fedAt) : now;
        newLog.fertilizer = logData.fertilizer;
        newLog.amount = logData.amount;
        break;
      case 'repottingLogs':
        newLog.repottedAt = logData.repottedAt ? new Date(logData.repottedAt) : now;
        newLog.potSize = logData.potSize;
        newLog.soilType = logData.soilType;
        break;
      case 'soilTopUpLogs':
        newLog.toppedUpAt = logData.toppedUpAt ? new Date(logData.toppedUpAt) : now;
        newLog.soilType = logData.soilType;
        newLog.amount = logData.amount;
        break;
      case 'pruningLogs':
        newLog.prunedAt = logData.prunedAt ? new Date(logData.prunedAt) : now;
        newLog.partsRemoved = logData.partsRemoved;
        newLog.reason = logData.reason;
        break;
    }

    const logKey = `${userId}_${logType}`;
    const userLogs = this.careLogs.get(logKey) || [];
    userLogs.push(newLog);
    this.careLogs.set(logKey, userLogs);

    console.log(`Mock Firebase: Added ${logType} log with ID ${newLog.id}`);
    return newLog;
  }

  // Get total counts for testing
  getTotalCounts(): { plants: number, careLogs: number } {
    let totalPlants = 0;
    let totalLogs = 0;
    
    this.plants.forEach(userPlants => totalPlants += userPlants.length);
    this.careLogs.forEach(userLogs => totalLogs += userLogs.length);
    
    return { plants: totalPlants, careLogs: totalLogs };
  }
  // Clear all data for a user
  async clearAllData(userId: string): Promise<void> {
    console.log(`Mock Firebase: Clearing all data for user ${userId}`);
    this.plants.delete(userId);
    
    // Clear all care logs for this user
    const careLogTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
    for (const logType of careLogTypes) {
      const key = `${userId}_${logType}`;
      this.careLogs.delete(key);
    }
  }

  // Clear user data (alias for clearAllData)
  async clearUserData(userId: string): Promise<void> {
    return this.clearAllData(userId);
  }
}

export const mockFirebaseStorage = new MockFirebaseStorage();