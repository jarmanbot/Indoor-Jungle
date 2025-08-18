// Mock Firebase storage service for testing Firebase API endpoints
// This simulates Firebase functionality without requiring full authentication

interface MockPlant {
  id: string;
  userId: string;
  name: string;
  babyName?: string;
  commonName?: string;
  latinName?: string;
  location: string;
  plantNumber?: number;
  lastWatered?: Date;
  lastFed?: Date;
  nextCheck?: Date;
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
  date: Date;
  notes?: string;
  createdAt: Date;
}

class MockFirebaseStorage {
  private plants: Map<string, MockPlant[]> = new Map();
  private careLogs: Map<string, MockCareLog[]> = new Map();

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
    
    const newPlant: MockPlant = {
      id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: plantData.name,
      babyName: plantData.babyName || '',
      commonName: plantData.commonName || '',
      latinName: plantData.latinName || '',
      location: plantData.location || 'living_room',
      plantNumber: plantData.plantNumber || plantData.id || 1,
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
    return userPlants[plantIndex];
  }

  // Delete plant
  async deletePlant(userId: string, plantId: string): Promise<void> {
    console.log(`Mock Firebase: Deleting plant ${plantId} for user ${userId}`);
    
    const userPlants = this.plants.get(userId) || [];
    const filteredPlants = userPlants.filter(plant => plant.id !== plantId);
    this.plants.set(userId, filteredPlants);
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
      date: logData.date ? new Date(logData.date) : new Date(),
      notes: logData.notes || '',
      createdAt: new Date(),
    };

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
}

export const mockFirebaseStorage = new MockFirebaseStorage();