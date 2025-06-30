// Alpha testing mode: enables localStorage-only data storage
// This ensures each tester has isolated data on their device

const ALPHA_MODE_KEY = 'alphaTestingMode';
const ALPHA_DATA_PREFIX = 'alpha_';
const ADMIN_PASSWORD = 'digipl@nts';

export function isAlphaTestingMode(): boolean {
  // Alpha mode is always on unless explicitly disabled with password
  const mode = window.localStorage.getItem(ALPHA_MODE_KEY);
  return mode !== 'disabled';
}

export function enableAlphaTestingMode(): void {
  window.localStorage.setItem(ALPHA_MODE_KEY, 'enabled');
  console.log('Alpha testing mode enabled - data will be stored locally');
}

export function disableAlphaTestingMode(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    window.localStorage.setItem(ALPHA_MODE_KEY, 'disabled');
    console.log('Alpha testing mode disabled - data will use server');
    return true;
  }
  return false;
}

// Simple storage helpers that work with the existing API structure
export const alphaStorage = {
  get: (key: string) => {
    try {
      const data = window.localStorage.getItem(ALPHA_DATA_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any) => {
    try {
      window.localStorage.setItem(ALPHA_DATA_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to alpha storage:', error);
    }
  },

  remove: (key: string) => {
    window.localStorage.removeItem(ALPHA_DATA_PREFIX + key);
  },

  clear: () => {
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith(ALPHA_DATA_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
  }
};

// Helper to generate IDs for localStorage
let nextId = 1;
export function getNextId(): number {
  const stored = alphaStorage.get('nextId') || 1;
  const id = Math.max(nextId, stored);
  nextId = id + 1;
  alphaStorage.set('nextId', nextId);
  return id;
}

// Helper to generate plant numbers - finds the next available number sequentially
export function getNextPlantNumber(): number {
  const plants = alphaStorage.get('plants') || [];
  
  // Get all existing plant numbers, sorted
  const existingNumbers = plants
    .map((plant: any) => plant.plantNumber)
    .filter((num: number) => typeof num === 'number')
    .sort((a: number, b: number) => a - b);
  
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
  
  return nextNumber;
}

// Initialize alpha testing mode with demo plant from server
export async function initializeAlphaMode(): Promise<void> {
  if (!isAlphaTestingMode()) return;
  
  const plants = alphaStorage.get('plants') || [];
  const demoPlantIndex = plants.findIndex((plant: any) => plant.plantNumber === 1);
  
  // If demo plant doesn't exist locally, fetch it from server
  if (demoPlantIndex === -1) {
    try {
      console.log('Alpha mode: Fetching demo plant #1 from server...');
      
      // Temporarily disable alpha mode to fetch from server
      const originalMode = window.localStorage.getItem(ALPHA_MODE_KEY);
      window.localStorage.setItem(ALPHA_MODE_KEY, 'disabled');
      
      const response = await fetch('/api/plants/1');
      
      // Restore alpha mode
      if (originalMode) {
        window.localStorage.setItem(ALPHA_MODE_KEY, originalMode);
      } else {
        window.localStorage.removeItem(ALPHA_MODE_KEY);
      }
      
      if (response.ok) {
        const serverPlant = await response.json();
        console.log('Alpha mode: Successfully fetched demo plant from server:', serverPlant);
        
        // Add server plant to local storage with some alpha mode modifications
        const demoPlant = {
          ...serverPlant,
          id: 1, // Ensure ID is 1 for consistency
          plantNumber: 1, // Ensure plant number is 1
          notes: (serverPlant.notes || '') + '\n\nThis demo plant is shared across all alpha testers and cannot be deleted in alpha mode.'
        };
        
        plants.unshift(demoPlant);
        alphaStorage.set('plants', plants);
        console.log('Alpha mode: Demo plant added to local storage');
      } else {
        console.log('Alpha mode: Could not fetch demo plant from server, using fallback');
        // Use fallback demo plant if server fetch fails
        const fallbackDemoPlant = {
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
          notes: "This is your demo plant to explore the app! This plant cannot be deleted in alpha mode.",
          imageUrl: "/demo-plant.gif",
          status: "healthy",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        plants.unshift(fallbackDemoPlant);
        alphaStorage.set('plants', plants);
      }
    } catch (error) {
      console.error('Alpha mode: Error fetching demo plant:', error);
      // Use fallback demo plant on error
      const fallbackDemoPlant = {
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
        notes: "This is your demo plant to explore the app! This plant cannot be deleted in alpha mode.",
        imageUrl: "/demo-plant.gif",
        status: "healthy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      plants.unshift(fallbackDemoPlant);
      alphaStorage.set('plants', plants);
    }
  }
    
  // Ensure next plant numbers start from 2
  if (!alphaStorage.get('nextPlantNumber')) {
    alphaStorage.set('nextPlantNumber', 2);
  }
}