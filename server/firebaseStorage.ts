// Real Firebase Realtime Database storage service
import { database } from './firebaseConfig';
import { ref, set, get, push, remove, child, query, orderByChild } from 'firebase/database';

interface Plant {
  id: string;
  userId: string;
  name: string;
  babyName?: string;
  commonName?: string;
  latinName?: string;
  location: string;
  plantNumber?: number;
  lastWatered?: string | null;
  lastFed?: string | null;
  nextCheck?: string | null;
  wateringFrequencyDays: number;
  feedingFrequencyDays: number;
  notes?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CareLog {
  id: string;
  plantId: string;
  userId: string;
  type: string;
  timestamp: string;
  notes?: string;
}

export interface IFirebaseStorage {
  // Plant operations
  getPlants(userId: string): Promise<Plant[]>;
  getPlant(userId: string, plantId: string): Promise<Plant | null>;
  createPlant(userId: string, plant: any): Promise<Plant>;
  updatePlant(userId: string, plantId: string, updates: any): Promise<Plant>;
  deletePlant(userId: string, plantId: string): Promise<void>;

  // Care log operations
  getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<CareLog[]>;
  addCareLog(userId: string, logType: string, logData: any): Promise<CareLog>;

  // Backup operations
  importPlants(userId: string, plantsData: any[]): Promise<number>;
  exportPlants(userId: string): Promise<any[]>;
}

export class FirebaseStorage implements IFirebaseStorage {
  
  // Get all plants for a user
  async getPlants(userId: string): Promise<Plant[]> {
    console.log(`Firebase: Getting plants for user ${userId}`);
    
    try {
      const plantsRef = ref(database, `users/${userId}/plants`);
      const snapshot = await get(plantsRef);
      
      if (snapshot.exists()) {
        const plantsData = snapshot.val();
        const plants = Object.keys(plantsData).map(key => ({
          ...plantsData[key],
          id: key
        }));
        
        console.log(`Firebase: Found ${plants.length} plants`);
        return plants.sort((a, b) => (a.plantNumber || 0) - (b.plantNumber || 0));
      }
      
      console.log(`Firebase: No plants found for user ${userId}`);
      return [];
    } catch (error) {
      console.error('Firebase: Error getting plants:', error);
      throw error;
    }
  }

  // Get specific plant
  async getPlant(userId: string, plantId: string): Promise<Plant | null> {
    console.log(`Firebase: Getting plant ${plantId} for user ${userId}`);
    
    try {
      const plantRef = ref(database, `users/${userId}/plants/${plantId}`);
      const snapshot = await get(plantRef);
      
      if (snapshot.exists()) {
        return { ...snapshot.val(), id: plantId };
      }
      
      return null;
    } catch (error) {
      console.error('Firebase: Error getting plant:', error);
      throw error;
    }
  }

  // Create new plant
  async createPlant(userId: string, plantData: any): Promise<Plant> {
    console.log(`Firebase: Creating plant for user ${userId}:`, plantData);
    
    try {
      // Get current plants to find the next available plant number
      const currentPlants = await this.getPlants(userId);
      
      // Find the lowest available plant number (reuse deleted numbers)
      let nextPlantNumber = 1;
      const usedNumbers = new Set(currentPlants.map(p => p.plantNumber || 0).filter(n => n > 0));
      
      while (usedNumbers.has(nextPlantNumber)) {
        nextPlantNumber++;
      }
      
      console.log(`Firebase: Assigning plant number ${nextPlantNumber}`);
      
      const plantsRef = ref(database, `users/${userId}/plants`);
      const newPlantRef = push(plantsRef);
      const plantId = newPlantRef.key;
      
      const newPlant: Plant = {
        id: plantId!,
        userId,
        name: plantData.name,
        babyName: plantData.babyName || '',
        commonName: plantData.commonName || '',
        latinName: plantData.latinName || '',
        location: plantData.location || 'living_room',
        plantNumber: nextPlantNumber,
        lastWatered: plantData.lastWatered || null,
        lastFed: plantData.lastFed || null,
        nextCheck: plantData.nextCheck || null,
        wateringFrequencyDays: plantData.wateringFrequencyDays || 7,
        feedingFrequencyDays: plantData.feedingFrequencyDays || 14,
        notes: plantData.notes || '',
        imageUrl: plantData.imageUrl || null,
        status: plantData.status || 'healthy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await set(newPlantRef, newPlant);
      
      console.log(`Firebase: Created plant with ID ${plantId}`);
      return newPlant;
    } catch (error) {
      console.error('Firebase: Error creating plant:', error);
      throw error;
    }
  }

  // Update plant
  async updatePlant(userId: string, plantId: string, updateData: any): Promise<Plant> {
    console.log(`Firebase: Updating plant ${plantId} for user ${userId}`);
    
    try {
      const plantRef = ref(database, `users/${userId}/plants/${plantId}`);
      const snapshot = await get(plantRef);
      
      if (!snapshot.exists()) {
        throw new Error('Plant not found');
      }
      
      const updatedPlant = {
        ...snapshot.val(),
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      await set(plantRef, updatedPlant);
      
      console.log(`Firebase: Updated plant ${plantId}`);
      return { ...updatedPlant, id: plantId };
    } catch (error) {
      console.error('Firebase: Error updating plant:', error);
      throw error;
    }
  }

  // Delete plant
  async deletePlant(userId: string, plantId: string): Promise<void> {
    console.log(`Firebase: Deleting plant ${plantId} for user ${userId}`);
    
    try {
      // Remove the plant
      const plantRef = ref(database, `users/${userId}/plants/${plantId}`);
      await remove(plantRef);
      
      // Also remove all care logs for this plant
      const careLogsRef = ref(database, `users/${userId}/care_logs`);
      const snapshot = await get(careLogsRef);
      
      if (snapshot.exists()) {
        const allLogs = snapshot.val();
        const logPromises = Object.keys(allLogs)
          .filter(logId => allLogs[logId].plantId === plantId)
          .map(logId => remove(ref(database, `users/${userId}/care_logs/${logId}`)));
        
        await Promise.all(logPromises);
      }
      
      console.log(`Firebase: Deleted plant ${plantId} and its care logs`);
    } catch (error) {
      console.error('Firebase: Error deleting plant:', error);
      throw error;
    }
  }

  // Get care logs for a plant
  async getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<CareLog[]> {
    console.log(`Firebase: Getting ${logType} logs for plant ${plantId}, user ${userId}`);
    
    try {
      const careLogsRef = ref(database, `users/${userId}/care_logs`);
      const snapshot = await get(careLogsRef);
      
      if (snapshot.exists()) {
        const allLogs = snapshot.val();
        const filteredLogs = Object.keys(allLogs)
          .filter(logId => {
            const log = allLogs[logId];
            return log.plantId === plantId && log.type === logType;
          })
          .map(logId => ({ ...allLogs[logId], id: logId }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return filteredLogs;
      }
      
      return [];
    } catch (error) {
      console.error('Firebase: Error getting care logs:', error);
      throw error;
    }
  }

  // Create care log
  async addCareLog(userId: string, logType: string, logData: any): Promise<CareLog> {
    console.log(`Firebase: Creating ${logType} log for user ${userId}`);
    
    try {
      const careLogsRef = ref(database, `users/${userId}/care_logs`);
      const newLogRef = push(careLogsRef);
      const logId = newLogRef.key;
      
      const newLog: CareLog = {
        id: logId!,
        plantId: logData.plantId,
        userId,
        type: logType,
        timestamp: new Date().toISOString(),
        notes: logData.notes || '',
      };

      await set(newLogRef, newLog);
      
      console.log(`Firebase: Created care log with ID ${logId}`);
      return newLog;
    } catch (error) {
      console.error('Firebase: Error creating care log:', error);
      throw error;
    }
  }

  // Import plants from backup (for migration)
  async importPlants(userId: string, plantsData: any[]): Promise<number> {
    console.log(`Firebase: Importing ${plantsData.length} plants for user ${userId}`);
    
    try {
      const plantsRef = ref(database, `users/${userId}/plants`);
      
      // Clear existing data first
      await remove(plantsRef);
      
      // Import each plant
      for (const plantData of plantsData) {
        const newPlantRef = push(plantsRef);
        const plantWithId = {
          ...plantData,
          id: newPlantRef.key,
          userId,
          createdAt: plantData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await set(newPlantRef, plantWithId);
      }
      
      console.log(`Firebase: Successfully imported ${plantsData.length} plants`);
      return plantsData.length;
    } catch (error) {
      console.error('Firebase: Error importing plants:', error);
      throw error;
    }
  }

  // Export plants for backup
  async exportPlants(userId: string): Promise<any[]> {
    console.log(`Firebase: Exporting plants for user ${userId}`);
    
    try {
      const plants = await this.getPlants(userId);
      console.log(`Firebase: Exported ${plants.length} plants`);
      return plants;
    } catch (error) {
      console.error('Firebase: Error exporting plants:', error);
      throw error;
    }
  }

  // Clear all user data (for imports)
  async clearUserData(userId: string): Promise<void> {
    console.log(`Firebase: Clearing all data for user ${userId}`);
    
    try {
      // Remove all plants
      const plantsRef = ref(database, `users/${userId}/plants`);
      await remove(plantsRef);
      
      // Remove all care logs
      const careLogsRef = ref(database, `users/${userId}/care_logs`);
      await remove(careLogsRef);
      
      console.log(`Firebase: Cleared all data for user ${userId}`);
    } catch (error) {
      console.error('Firebase: Error clearing user data:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const firebaseStorage = new FirebaseStorage();