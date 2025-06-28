import { 
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

const STORAGE_KEYS = {
  PLANTS: 'plants',
  CUSTOM_LOCATIONS: 'customLocations',
  WATERING_LOGS: 'wateringLogs',
  FEEDING_LOGS: 'feedingLogs',
  REPOTTING_LOGS: 'repottingLogs',
  SOIL_TOP_UP_LOGS: 'soilTopUpLogs',
  PRUNING_LOGS: 'pruningLogs',
  NEXT_ID: 'nextId',
  NEXT_PLANT_NUMBER: 'nextPlantNumber'
};

export class LocalStorageManager {
  private getNextId(): number {
    const currentId = parseInt(window.localStorage.getItem(STORAGE_KEYS.NEXT_ID) || '1');
    window.localStorage.setItem(STORAGE_KEYS.NEXT_ID, (currentId + 1).toString());
    return currentId;
  }

  private getNextPlantNumber(): number {
    const currentNumber = parseInt(window.localStorage.getItem(STORAGE_KEYS.NEXT_PLANT_NUMBER) || '1');
    window.localStorage.setItem(STORAGE_KEYS.NEXT_PLANT_NUMBER, (currentNumber + 1).toString());
    return currentNumber;
  }

  // Plant methods
  getPlants(): Plant[] {
    try {
      const plants = window.localStorage.getItem(STORAGE_KEYS.PLANTS);
      return plants ? JSON.parse(plants) : [];
    } catch (error) {
      console.error('Error loading plants:', error);
      return [];
    }
  }

  getPlant(id: number): Plant | undefined {
    const plants = this.getPlants();
    return plants.find(plant => plant.id === id);
  }

  createPlant(insertPlant: InsertPlant): Plant {
    const plants = this.getPlants();
    const newPlant: Plant = {
      ...insertPlant,
      id: this.getNextId(),
      plantNumber: insertPlant.plantNumber || this.getNextPlantNumber(),
      name: insertPlant.name || insertPlant.babyName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    plants.push(newPlant);
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
    return newPlant;
  }

  updatePlant(id: number, updates: Partial<InsertPlant>): Plant | undefined {
    const plants = this.getPlants();
    const index = plants.findIndex(plant => plant.id === id);
    
    if (index === -1) return undefined;
    
    plants[index] = {
      ...plants[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
    return plants[index];
  }

  deletePlant(id: number): boolean {
    const plants = this.getPlants();
    const filteredPlants = plants.filter(plant => plant.id !== id);
    
    if (filteredPlants.length === plants.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(filteredPlants));
    
    // Also delete related logs
    this.deleteLogsByPlantId('watering', id);
    this.deleteLogsByPlantId('feeding', id);
    this.deleteLogsByPlantId('repotting', id);
    this.deleteLogsByPlantId('soilTopUp', id);
    this.deleteLogsByPlantId('pruning', id);
    
    return true;
  }

  searchPlants(query: string): Plant[] {
    const plants = this.getPlants();
    const lowerQuery = query.toLowerCase();
    
    return plants.filter(plant => 
      plant.babyName?.toLowerCase().includes(lowerQuery) ||
      plant.commonName?.toLowerCase().includes(lowerQuery) ||
      plant.latinName?.toLowerCase().includes(lowerQuery) ||
      plant.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  getPlantsByLocation(location: string): Plant[] {
    const plants = this.getPlants();
    return plants.filter(plant => plant.location === location);
  }

  // Custom Location methods
  getCustomLocations(): CustomLocation[] {
    try {
      const locations = localStorage.getItem(STORAGE_KEYS.CUSTOM_LOCATIONS);
      return locations ? JSON.parse(locations) : [];
    } catch (error) {
      console.error('Error loading custom locations:', error);
      return [];
    }
  }

  createCustomLocation(insertLocation: InsertCustomLocation): CustomLocation {
    const locations = this.getCustomLocations();
    const newLocation: CustomLocation = {
      ...insertLocation,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    locations.push(newLocation);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LOCATIONS, JSON.stringify(locations));
    return newLocation;
  }

  deleteCustomLocation(id: number): boolean {
    const locations = this.getCustomLocations();
    const filteredLocations = locations.filter(location => location.id !== id);
    
    if (filteredLocations.length === locations.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LOCATIONS, JSON.stringify(filteredLocations));
    return true;
  }

  // Care Log methods
  private getLogKey(type: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning'): string {
    switch (type) {
      case 'watering': return STORAGE_KEYS.WATERING_LOGS;
      case 'feeding': return STORAGE_KEYS.FEEDING_LOGS;
      case 'repotting': return STORAGE_KEYS.REPOTTING_LOGS;
      case 'soilTopUp': return STORAGE_KEYS.SOIL_TOP_UP_LOGS;
      case 'pruning': return STORAGE_KEYS.PRUNING_LOGS;
    }
  }

  private getLogs<T>(type: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning'): T[] {
    try {
      const logs = localStorage.getItem(this.getLogKey(type));
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error(`Error loading ${type} logs:`, error);
      return [];
    }
  }

  private saveLogs<T>(type: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning', logs: T[]): void {
    localStorage.setItem(this.getLogKey(type), JSON.stringify(logs));
  }

  private deleteLogsByPlantId(type: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning', plantId: number): void {
    const logs = this.getLogs(type);
    const filteredLogs = logs.filter((log: any) => log.plantId !== plantId);
    this.saveLogs(type, filteredLogs);
  }

  // Watering logs
  getWateringLogs(plantId: number): WateringLog[] {
    const logs = this.getLogs<WateringLog>('watering');
    return logs
      .filter(log => log.plantId === plantId)
      .sort((a, b) => new Date(b.wateredAt).getTime() - new Date(a.wateredAt).getTime());
  }

  addWateringLog(insertLog: InsertWateringLog): WateringLog {
    const logs = this.getLogs<WateringLog>('watering');
    const newLog: WateringLog = {
      ...insertLog,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    logs.push(newLog);
    this.saveLogs('watering', logs);
    
    // Update plant's lastWatered
    this.updatePlant(insertLog.plantId, { lastWatered: insertLog.wateredAt });
    
    return newLog;
  }

  deleteWateringLog(id: number): boolean {
    const logs = this.getLogs<WateringLog>('watering');
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    this.saveLogs('watering', filteredLogs);
    return true;
  }

  // Feeding logs
  getFeedingLogs(plantId: number): FeedingLog[] {
    const logs = this.getLogs<FeedingLog>('feeding');
    return logs
      .filter(log => log.plantId === plantId)
      .sort((a, b) => new Date(b.fedAt).getTime() - new Date(a.fedAt).getTime());
  }

  addFeedingLog(insertLog: InsertFeedingLog): FeedingLog {
    const logs = this.getLogs<FeedingLog>('feeding');
    const newLog: FeedingLog = {
      ...insertLog,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    logs.push(newLog);
    this.saveLogs('feeding', logs);
    
    // Update plant's lastFed
    this.updatePlant(insertLog.plantId, { lastFed: insertLog.fedAt });
    
    return newLog;
  }

  deleteFeedingLog(id: number): boolean {
    const logs = this.getLogs<FeedingLog>('feeding');
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    this.saveLogs('feeding', filteredLogs);
    return true;
  }

  // Repotting logs
  getRepottingLogs(plantId: number): RepottingLog[] {
    const logs = this.getLogs<RepottingLog>('repotting');
    return logs
      .filter(log => log.plantId === plantId)
      .sort((a, b) => new Date(b.repottedAt).getTime() - new Date(a.repottedAt).getTime());
  }

  addRepottingLog(insertLog: InsertRepottingLog): RepottingLog {
    const logs = this.getLogs<RepottingLog>('repotting');
    const newLog: RepottingLog = {
      ...insertLog,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    logs.push(newLog);
    this.saveLogs('repotting', logs);
    return newLog;
  }

  deleteRepottingLog(id: number): boolean {
    const logs = this.getLogs<RepottingLog>('repotting');
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    this.saveLogs('repotting', filteredLogs);
    return true;
  }

  // Soil top-up logs
  getSoilTopUpLogs(plantId: number): SoilTopUpLog[] {
    const logs = this.getLogs<SoilTopUpLog>('soilTopUp');
    return logs
      .filter(log => log.plantId === plantId)
      .sort((a, b) => new Date(b.toppedUpAt).getTime() - new Date(a.toppedUpAt).getTime());
  }

  addSoilTopUpLog(insertLog: InsertSoilTopUpLog): SoilTopUpLog {
    const logs = this.getLogs<SoilTopUpLog>('soilTopUp');
    const newLog: SoilTopUpLog = {
      ...insertLog,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    logs.push(newLog);
    this.saveLogs('soilTopUp', logs);
    return newLog;
  }

  deleteSoilTopUpLog(id: number): boolean {
    const logs = this.getLogs<SoilTopUpLog>('soilTopUp');
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    this.saveLogs('soilTopUp', filteredLogs);
    return true;
  }

  // Pruning logs
  getPruningLogs(plantId: number): PruningLog[] {
    const logs = this.getLogs<PruningLog>('pruning');
    return logs
      .filter(log => log.plantId === plantId)
      .sort((a, b) => new Date(b.prunedAt).getTime() - new Date(a.prunedAt).getTime());
  }

  addPruningLog(insertLog: InsertPruningLog): PruningLog {
    const logs = this.getLogs<PruningLog>('pruning');
    const newLog: PruningLog = {
      ...insertLog,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    
    logs.push(newLog);
    this.saveLogs('pruning', logs);
    return newLog;
  }

  deletePruningLog(id: number): boolean {
    const logs = this.getLogs<PruningLog>('pruning');
    const filteredLogs = logs.filter(log => log.id !== id);
    
    if (filteredLogs.length === logs.length) return false;
    
    this.saveLogs('pruning', filteredLogs);
    return true;
  }

  // Utility methods
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      plants: this.getPlants(),
      customLocations: this.getCustomLocations(),
      wateringLogs: this.getLogs<WateringLog>('watering'),
      feedingLogs: this.getLogs<FeedingLog>('feeding'),
      repottingLogs: this.getLogs<RepottingLog>('repotting'),
      soilTopUpLogs: this.getLogs<SoilTopUpLog>('soilTopUp'),
      pruningLogs: this.getLogs<PruningLog>('pruning'),
      nextId: localStorage.getItem(STORAGE_KEYS.NEXT_ID),
      nextPlantNumber: localStorage.getItem(STORAGE_KEYS.NEXT_PLANT_NUMBER)
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.plants) localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(data.plants));
      if (data.customLocations) localStorage.setItem(STORAGE_KEYS.CUSTOM_LOCATIONS, JSON.stringify(data.customLocations));
      if (data.wateringLogs) localStorage.setItem(STORAGE_KEYS.WATERING_LOGS, JSON.stringify(data.wateringLogs));
      if (data.feedingLogs) localStorage.setItem(STORAGE_KEYS.FEEDING_LOGS, JSON.stringify(data.feedingLogs));
      if (data.repottingLogs) localStorage.setItem(STORAGE_KEYS.REPOTTING_LOGS, JSON.stringify(data.repottingLogs));
      if (data.soilTopUpLogs) localStorage.setItem(STORAGE_KEYS.SOIL_TOP_UP_LOGS, JSON.stringify(data.soilTopUpLogs));
      if (data.pruningLogs) localStorage.setItem(STORAGE_KEYS.PRUNING_LOGS, JSON.stringify(data.pruningLogs));
      if (data.nextId) localStorage.setItem(STORAGE_KEYS.NEXT_ID, data.nextId);
      if (data.nextPlantNumber) localStorage.setItem(STORAGE_KEYS.NEXT_PLANT_NUMBER, data.nextPlantNumber);
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }
}

export const localStorageManager = new LocalStorageManager();