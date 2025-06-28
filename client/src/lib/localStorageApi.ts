import { localStorage } from './localStorage';
import type { 
  Plant, 
  InsertPlant,
  CustomLocation,
  InsertCustomLocation,
  WateringLog,
  InsertWateringLog,
  FeedingLog,
  InsertFeedingLog,
  RepottingLog,
  InsertRepottingLog,
  SoilTopUpLog,
  InsertSoilTopUpLog,
  PruningLog,
  InsertPruningLog
} from "@shared/schema";

// Mock API that uses localStorage instead of backend
export class LocalStorageAPI {
  // Plant endpoints
  async getPlants(): Promise<Plant[]> {
    return localStorage.getPlants();
  }

  async getPlant(id: number): Promise<Plant | null> {
    return localStorage.getPlant(id) || null;
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    return localStorage.createPlant(plant);
  }

  async updatePlant(id: number, updates: Partial<InsertPlant>): Promise<Plant | null> {
    return localStorage.updatePlant(id, updates) || null;
  }

  async deletePlant(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deletePlant(id);
    return { success };
  }

  async searchPlants(query: string): Promise<Plant[]> {
    return localStorage.searchPlants(query);
  }

  async getPlantsByLocation(location: string): Promise<Plant[]> {
    return localStorage.getPlantsByLocation(location);
  }

  // Custom location endpoints
  async getCustomLocations(): Promise<CustomLocation[]> {
    return localStorage.getCustomLocations();
  }

  async createCustomLocation(location: InsertCustomLocation): Promise<CustomLocation> {
    return localStorage.createCustomLocation(location);
  }

  async deleteCustomLocation(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deleteCustomLocation(id);
    return { success };
  }

  // Care log endpoints
  async getWateringLogs(plantId: number): Promise<WateringLog[]> {
    return localStorage.getWateringLogs(plantId);
  }

  async addWateringLog(log: InsertWateringLog): Promise<WateringLog> {
    return localStorage.addWateringLog(log);
  }

  async deleteWateringLog(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deleteWateringLog(id);
    return { success };
  }

  async getFeedingLogs(plantId: number): Promise<FeedingLog[]> {
    return localStorage.getFeedingLogs(plantId);
  }

  async addFeedingLog(log: InsertFeedingLog): Promise<FeedingLog> {
    return localStorage.addFeedingLog(log);
  }

  async deleteFeedingLog(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deleteFeedingLog(id);
    return { success };
  }

  async getRepottingLogs(plantId: number): Promise<RepottingLog[]> {
    return localStorage.getRepottingLogs(plantId);
  }

  async addRepottingLog(log: InsertRepottingLog): Promise<RepottingLog> {
    return localStorage.addRepottingLog(log);
  }

  async deleteRepottingLog(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deleteRepottingLog(id);
    return { success };
  }

  async getSoilTopUpLogs(plantId: number): Promise<SoilTopUpLog[]> {
    return localStorage.getSoilTopUpLogs(plantId);
  }

  async addSoilTopUpLog(log: InsertSoilTopUpLog): Promise<SoilTopUpLog> {
    return localStorage.addSoilTopUpLog(log);
  }

  async deleteSoilTopUpLog(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deleteSoilTopUpLog(id);
    return { success };
  }

  async getPruningLogs(plantId: number): Promise<PruningLog[]> {
    return localStorage.getPruningLogs(plantId);
  }

  async addPruningLog(log: InsertPruningLog): Promise<PruningLog> {
    return localStorage.addPruningLog(log);
  }

  async deletePruningLog(id: number): Promise<{ success: boolean }> {
    const success = localStorage.deletePruningLog(id);
    return { success };
  }

  // Utility methods
  async exportData(): Promise<string> {
    return localStorage.exportData();
  }

  async importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      localStorage.importData(jsonData);
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Import failed' 
      };
    }
  }

  async clearAllData(): Promise<{ success: boolean }> {
    localStorage.clearAllData();
    return { success: true };
  }
}

export const localStorageAPI = new LocalStorageAPI();