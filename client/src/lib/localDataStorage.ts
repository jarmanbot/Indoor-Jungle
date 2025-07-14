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
      defaultWateringFreq: parseInt(window.localStorage.getItem('defaultWateringFreq') || '7'),
      defaultFeedingFreq: parseInt(window.localStorage.getItem('defaultFeedingFreq') || '14'),
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
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Add more debugging and try different approaches
  console.log('Creating download with filename:', link.download);
  console.log('Blob size:', dataBlob.size, 'bytes');
  console.log('URL created:', url);
  
  // Try to trigger download with multiple approaches
  try {
    // First try the standard approach
    link.click();
    console.log('Download link clicked successfully');
  } catch (error) {
    console.error('Error clicking download link:', error);
    
    // Fallback: try using a different approach
    try {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(event);
      console.log('Fallback download method attempted');
    } catch (fallbackError) {
      console.error('Fallback download method failed:', fallbackError);
      
      // Last resort: try opening as data URL
      try {
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const newWindow = window.open(dataUrl, '_blank');
        if (newWindow) {
          console.log('Opened data in new window - you may need to save manually');
        } else {
          console.error('Failed to open new window - popup blocked?');
        }
      } catch (dataUrlError) {
        console.error('Data URL method failed:', dataUrlError);
      }
    }
  }
  
  // Clean up
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 2000);
  
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
          window.localStorage.setItem('defaultWateringFreq', data.settings.defaultWateringFreq.toString());
          window.localStorage.setItem('defaultFeedingFreq', data.settings.defaultFeedingFreq.toString());
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

// Initialize local storage (no longer auto-adds demo plant)
export function initializeLocalStorage(): void {
  // Clean up any orphaned data
  cleanupLocalData();
}

// Check if we're using local storage (always true now)
export function isUsingLocalStorage(): boolean {
  return true;
}