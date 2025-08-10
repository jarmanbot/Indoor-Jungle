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
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(LOCAL_DATA_PREFIX + key, serialized);
    } catch (error: any) {
      console.error('Failed to save to local storage:', error);
      if (error.name === 'QuotaExceededError') {
        const usage = getStorageUsage();
        const plantUsage = getPlantCountUsage();
        if (plantUsage.needsGoogleDrive) {
          throw new Error(`Plant limit reached (${plantUsage.current}/${plantUsage.max}). Enable Google Drive storage for unlimited plants, or export data and remove some plants.`);
        } else {
          throw new Error(`Storage quota exceeded. Current usage: ${(usage.used / 1024 / 1024).toFixed(2)}MB / ${(usage.total / 1024 / 1024).toFixed(2)}MB. Try exporting your data and removing some plant images to free up space.`);
        }
      }
      throw error;
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

// Plant count limits for localStorage vs Google Drive
export const STORAGE_LIMITS = {
  LOCAL_STORAGE_MAX_PLANTS: 25, // Max plants before requiring Google Drive
  GOOGLE_DRIVE_UNLIMITED: true
};

// Get localStorage usage statistics
export function getStorageUsage() {
  let used = 0;
  for (let key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      used += window.localStorage[key].length + key.length;
    }
  }
  
  // Most browsers have a localStorage limit around 5-10MB
  const estimated = 10 * 1024 * 1024; // Estimate 10MB limit
  return {
    used: used * 2, // JavaScript strings are UTF-16, so 2 bytes per character
    total: estimated,
    percentage: ((used * 2) / estimated) * 100
  };
}

// Get plant count usage statistics  
export function getPlantCountUsage() {
  const plants = localStorage.get('plants') || [];
  const currentCount = plants.length;
  const maxCount = STORAGE_LIMITS.LOCAL_STORAGE_MAX_PLANTS;
  
  return {
    current: currentCount,
    max: maxCount,
    percentage: (currentCount / maxCount) * 100,
    isAtLimit: currentCount >= maxCount,
    needsGoogleDrive: currentCount >= maxCount
  };
}

// Compress plant image data to save storage space
export function compressPlantImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Reduce image size for storage efficiency
      const maxWidth = 200; // Reduced from 400px
      const maxHeight = 200;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Use lower quality for smaller file size
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // Reduced from 0.7
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

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

  const dataStr = JSON.stringify(exportData, null, 2);
  const filename = `plant-data-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  // Try browser's native file system access API first (if available)
  if ('showSaveFilePicker' in window) {
    try {
      // @ts-ignore - showSaveFilePicker is a new browser API
      window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }]
      }).then((fileHandle: any) => {
        return fileHandle.createWritable();
      }).then((writable: any) => {
        writable.write(dataStr);
        writable.close();
        console.log('File saved using File System Access API');
      }).catch((error: any) => {
        console.log('File System Access API cancelled or failed:', error);
        fallbackDownload(dataStr, filename);
      });
      return;
    } catch (error) {
      console.log('File System Access API not supported, using fallback');
    }
  }
  
  // Fallback to traditional download
  fallbackDownload(dataStr, filename);
}

function fallbackDownload(dataStr: string, filename: string): void {
  // Create a data URL that opens in a new tab for manual saving
  const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  // Try to trigger download first
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Force user interaction by requiring them to click
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  
  link.dispatchEvent(clickEvent);
  
  // If that doesn't work, open in new window
  setTimeout(() => {
    const newWindow = window.open(dataUrl, '_blank');
    if (newWindow) {
      // Add instructions to the new window
      setTimeout(() => {
        try {
          newWindow.document.body.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h2>Plant Data Export</h2>
              <p>Your plant data is ready for download. If the download didn't start automatically:</p>
              <ol>
                <li>Right-click on this page</li>
                <li>Select "Save As..." or "Save Page As..."</li>
                <li>Save the file as: <strong>${filename}</strong></li>
              </ol>
              <p><strong>Or copy the data below and save it manually:</strong></p>
              <textarea style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;" readonly>${dataStr}</textarea>
              <br><br>
              <button onclick="window.close();" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
          `;
        } catch (e) {
          console.log('Could not modify new window content');
        }
      }, 500);
      console.log('Opened export data in new window for manual saving');
    } else {
      console.error('Could not open new window - popup blocked');
      // Store in sessionStorage as last resort
      sessionStorage.setItem('plantDataExport', dataStr);
      sessionStorage.setItem('plantDataExportFilename', filename);
      alert(`Export ready! The download may be blocked. Check your Downloads folder, or if that doesn't work, go to Settings and try the "Copy Export Data" option.`);
    }
    
    // Clean up
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 1000);
  
  console.log('Plant data exported successfully');
}

// Import user data from a JSON file
export function importUserData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting import of file:', file.name, 'Size:', file.size, 'bytes');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        console.log('File read successfully, parsing JSON...');
        
        let data: ExportData;
        try {
          data = JSON.parse(result);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          throw new Error('Invalid JSON format. Please check the file is a valid plant data export.');
        }
        
        console.log('JSON parsed successfully:', data);
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format: not an object');
        }
        
        if (!data.plants || !Array.isArray(data.plants)) {
          throw new Error('Invalid data format: missing or invalid plants array');
        }
        
        console.log(`Found ${data.plants.length} plants to import`);
        
        // Clear existing data before importing
        console.log('Clearing existing data...');
        localStorage.clear();
        
        // Import all data with validation
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
        
        // Update nextId to prevent conflicts
        const maxId = Math.max(
          ...data.plants.map((p: any) => p.id || 0),
          ...(data.wateringLogs || []).map((l: any) => l.id || 0),
          ...(data.feedingLogs || []).map((l: any) => l.id || 0),
          ...(data.repottingLogs || []).map((l: any) => l.id || 0),
          ...(data.soilTopUpLogs || []).map((l: any) => l.id || 0),
          ...(data.pruningLogs || []).map((l: any) => l.id || 0)
        );
        localStorage.set('nextId', maxId + 1);
        
        console.log('Plant data imported successfully');
        console.log(`Imported ${data.plants.length} plants from ${data.exportDate}`);
        console.log('Import complete - all data restored');
        resolve();
      } catch (error) {
        console.error('Failed to import data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      console.error('Failed to read file');
      reject(new Error('Failed to read file. Please try again.'));
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