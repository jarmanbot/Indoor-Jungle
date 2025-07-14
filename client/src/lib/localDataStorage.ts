// Local data storage system with export/import functionality
// Replaces alpha testing mode with permanent local storage

const LOCAL_DATA_PREFIX = 'plant_app_';

export interface ExportData {
  plants: any[];
  customLocations: string[];
  wateringLogs: any[];
  feedingLogs: any[];
  repottingLogs: any[];
  soilTopUpLogs: any[];
  pruningLogs: any[];
  settings: {
    defaultWateringFreq: number;
    defaultFeedingFreq: number;
  };
  exportDate: string;
  version: string;
}

// Simple storage helpers for local data
export const localStorage = {
  get: (key: string) => {
    try {
      const data = window.localStorage.getItem(LOCAL_DATA_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any) => {
    try {
      window.localStorage.setItem(LOCAL_DATA_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  },

  remove: (key: string) => {
    window.localStorage.removeItem(LOCAL_DATA_PREFIX + key);
  },

  clear: () => {
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith(LOCAL_DATA_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
  }
};

// Export all user data to a downloadable JSON file
export function exportUserData(): void {
  const exportData: ExportData = {
    plants: localStorage.get('plants') || [],
    customLocations: localStorage.get('customLocations') || [],
    wateringLogs: localStorage.get('wateringLogs') || [],
    feedingLogs: localStorage.get('feedingLogs') || [],
    repottingLogs: localStorage.get('repottingLogs') || [],
    soilTopUpLogs: localStorage.get('soilTopUpLogs') || [],
    pruningLogs: localStorage.get('pruningLogs') || [],
    settings: {
      defaultWateringFreq: parseInt(localStorage.getItem('defaultWateringFreq') || '7'),
      defaultFeedingFreq: parseInt(localStorage.getItem('defaultFeedingFreq') || '14'),
    },
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  // Create and download the file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `plant-data-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  console.log('Plant data exported successfully');
}

// Import user data from a JSON file
export function importUserData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        
        // Validate the data structure
        if (!data.plants || !Array.isArray(data.plants)) {
          throw new Error('Invalid data format: missing or invalid plants array');
        }
        
        // Import all data
        localStorage.set('plants', data.plants);
        localStorage.set('customLocations', data.customLocations || []);
        localStorage.set('wateringLogs', data.wateringLogs || []);
        localStorage.set('feedingLogs', data.feedingLogs || []);
        localStorage.set('repottingLogs', data.repottingLogs || []);
        localStorage.set('soilTopUpLogs', data.soilTopUpLogs || []);
        localStorage.set('pruningLogs', data.pruningLogs || []);
        
        // Import settings
        if (data.settings) {
          localStorage.setItem('defaultWateringFreq', data.settings.defaultWateringFreq.toString());
          localStorage.setItem('defaultFeedingFreq', data.settings.defaultFeedingFreq.toString());
        }
        
        console.log('Plant data imported successfully');
        console.log(`Imported ${data.plants.length} plants from ${data.exportDate}`);
        resolve();
      } catch (error) {
        console.error('Failed to import data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Clean up orphaned data - removes care logs for plants that no longer exist
export function cleanupLocalData(): void {
  const plants = localStorage.get('plants') || [];
  const plantIds = plants.map((p: any) => p.id);
  
  // Clean up orphaned logs for all log types
  const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
  
  logTypes.forEach(logType => {
    const logs = localStorage.get(logType) || [];
    const validLogs = logs.filter((log: any) => plantIds.includes(log.plantId));
    if (validLogs.length !== logs.length) {
      localStorage.set(logType, validLogs);
      console.log(`Cleaned up ${logs.length - validLogs.length} orphaned ${logType}`);
    }
  });
}

// Helper to generate IDs for localStorage
let nextId = 1;
export function getNextId(): number {
  const stored = localStorage.get('nextId') || 1;
  const id = Math.max(nextId, stored);
  nextId = id + 1;
  localStorage.set('nextId', nextId);
  return id;
}

// Helper to generate plant numbers - finds the next available number sequentially
export function getNextPlantNumber(): number {
  const plants = localStorage.get('plants') || [];
  
  // Get all existing plant numbers, sorted
  const existingNumbers = plants
    .map((plant: any) => plant.plantNumber)
    .filter((num: number) => typeof num === 'number')
    .sort((a: number, b: number) => a - b);
  
  console.log('getNextPlantNumber - existing plants:', plants.length);
  console.log('getNextPlantNumber - existing numbers:', existingNumbers);
  
  // Find the first gap in the sequence, starting from 1
  let nextNumber = 1;
  for (const existingNumber of existingNumbers) {
    if (existingNumber === nextNumber) {
      nextNumber++;
    } else if (existingNumber > nextNumber) {
      // Found a gap, use the current nextNumber
      break;
    }
  }
  
  console.log('getNextPlantNumber - returning:', nextNumber);
  return nextNumber;
}

// Initialize local storage with demo plant if no plants exist
export function initializeLocalStorage(): void {
  const plants = localStorage.get('plants') || [];
  
  // If no plants exist, add a demo plant
  if (plants.length === 0) {
    const demoPlant = {
      id: 1,
      plantNumber: 1,
      babyName: "Demo Plant",
      commonName: "Sample Houseplant",
      latinName: "Plantus Demonstratus",
      name: "Demo Plant",
      location: "living_room",
      lastWatered: null,
      nextCheck: null,
      lastFed: null,
      wateringFrequencyDays: 7,
      feedingFrequencyDays: 14,
      notes: "This is your demo plant to explore the app! You can delete it and add your own plants.",
      imageUrl: "/demo-plant.gif",
      status: "healthy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.set('plants', [demoPlant]);
    console.log('Demo plant added to local storage');
  }
  
  // Clean up any orphaned data
  cleanupLocalData();
}

// Check if we're using local storage (always true now)
export function isUsingLocalStorage(): boolean {
  return true;
}