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

// Clean up unnecessary data - removes orphaned logs and unnecessary assets
export function cleanupAlphaData(): void {
  if (!isAlphaTestingMode()) return;
  
  const plants = alphaStorage.get('plants') || [];
  const plantIds = plants.map((p: any) => p.id);
  
  // Clean up orphaned watering logs
  const wateringLogs = alphaStorage.get('wateringLogs') || [];
  const validWateringLogs = wateringLogs.filter((log: any) => plantIds.includes(log.plantId));
  if (validWateringLogs.length !== wateringLogs.length) {
    alphaStorage.set('wateringLogs', validWateringLogs);
    console.log(`Cleaned up ${wateringLogs.length - validWateringLogs.length} orphaned watering logs`);
  }
  
  // Clean up orphaned feeding logs
  const feedingLogs = alphaStorage.get('feedingLogs') || [];
  const validFeedingLogs = feedingLogs.filter((log: any) => plantIds.includes(log.plantId));
  if (validFeedingLogs.length !== feedingLogs.length) {
    alphaStorage.set('feedingLogs', validFeedingLogs);
    console.log(`Cleaned up ${feedingLogs.length - validFeedingLogs.length} orphaned feeding logs`);
  }
  
  // Clean up orphaned repotting logs
  const repottingLogs = alphaStorage.get('repottingLogs') || [];
  const validRepottingLogs = repottingLogs.filter((log: any) => plantIds.includes(log.plantId));
  if (validRepottingLogs.length !== repottingLogs.length) {
    alphaStorage.set('repottingLogs', validRepottingLogs);
    console.log(`Cleaned up ${repottingLogs.length - validRepottingLogs.length} orphaned repotting logs`);
  }
  
  // Clean up orphaned soil top-up logs
  const soilTopUpLogs = alphaStorage.get('soilTopUpLogs') || [];
  const validSoilTopUpLogs = soilTopUpLogs.filter((log: any) => plantIds.includes(log.plantId));
  if (validSoilTopUpLogs.length !== soilTopUpLogs.length) {
    alphaStorage.set('soilTopUpLogs', validSoilTopUpLogs);
    console.log(`Cleaned up ${soilTopUpLogs.length - validSoilTopUpLogs.length} orphaned soil top-up logs`);
  }
  
  // Clean up orphaned pruning logs
  const pruningLogs = alphaStorage.get('pruningLogs') || [];
  const validPruningLogs = pruningLogs.filter((log: any) => plantIds.includes(log.plantId));
  if (validPruningLogs.length !== pruningLogs.length) {
    alphaStorage.set('pruningLogs', validPruningLogs);
    console.log(`Cleaned up ${pruningLogs.length - validPruningLogs.length} orphaned pruning logs`);
  }
};

// Helper to generate IDs for localStorage
let nextId = 2; // Start from 2 since demo plant uses ID 1
export function getNextId(): number {
  const stored = alphaStorage.get('nextId') || 2; // Start from 2 to avoid collision with demo plant
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

// Fix existing plants with duplicate IDs
function fixDuplicateIds(): void {
  const plants = alphaStorage.get('plants') || [];
  let hasChanges = false;
  
  // Find plants with duplicate IDs
  const idMap = new Map<number, any[]>();
  plants.forEach((plant: any, index: number) => {
    if (!idMap.has(plant.id)) {
      idMap.set(plant.id, []);
    }
    idMap.get(plant.id)!.push({ plant, index });
  });
  
  // Fix duplicates by reassigning IDs to non-demo plants
  idMap.forEach((plantsWithSameId, id) => {
    if (plantsWithSameId.length > 1) {
      console.log(`Found ${plantsWithSameId.length} plants with duplicate ID ${id}`);
      
      // Keep the demo plant (plantNumber 1) with its original ID
      const demoPlant = plantsWithSameId.find(p => p.plant.plantNumber === 1);
      const otherPlants = plantsWithSameId.filter(p => p.plant.plantNumber !== 1);
      
      // Reassign IDs to other plants
      otherPlants.forEach(({ plant, index }) => {
        const newId = getNextId();
        console.log(`Reassigning plant "${plant.babyName || plant.name}" from ID ${plant.id} to ID ${newId}`);
        plants[index].id = newId;
        hasChanges = true;
      });
    }
  });
  
  if (hasChanges) {
    alphaStorage.set('plants', plants);
    console.log('Fixed duplicate plant IDs');
  }
}

// Initialize alpha testing mode with demo plant from server
export async function initializeAlphaMode(): Promise<void> {
  console.log('initializeAlphaMode called, alpha mode enabled:', isAlphaTestingMode());
  if (!isAlphaTestingMode()) return;
  
  // First fix any existing duplicate IDs and clean up orphaned data
  fixDuplicateIds();
  cleanupAlphaData();
  
  const plants = alphaStorage.get('plants') || [];
  console.log('Current plants in storage:', plants);
  const demoPlantIndex = plants.findIndex((plant: any) => plant.plantNumber === 1);
  console.log('Demo plant index:', demoPlantIndex);
  
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

// Check if demo plant is enabled
export function isDemoPlantEnabled(): boolean {
  if (!isAlphaTestingMode()) return false;
  const plants = alphaStorage.get('plants') || [];
  return plants.some((plant: any) => plant.plantNumber === 1);
}

// Remove demo plant and its care logs
export function removeDemoPlant(): void {
  if (!isAlphaTestingMode()) return;
  
  const plants = alphaStorage.get('plants') || [];
  const updatedPlants = plants.filter((plant: any) => plant.plantNumber !== 1);
  alphaStorage.set('plants', updatedPlants);
  
  // Remove all care logs for demo plant (ID 1)
  const wateringLogs = alphaStorage.get('wateringLogs') || [];
  const updatedWateringLogs = wateringLogs.filter((log: any) => log.plantId !== 1);
  alphaStorage.set('wateringLogs', updatedWateringLogs);
  
  const feedingLogs = alphaStorage.get('feedingLogs') || [];
  const updatedFeedingLogs = feedingLogs.filter((log: any) => log.plantId !== 1);
  alphaStorage.set('feedingLogs', updatedFeedingLogs);
  
  const repottingLogs = alphaStorage.get('repottingLogs') || [];
  const updatedRepottingLogs = repottingLogs.filter((log: any) => log.plantId !== 1);
  alphaStorage.set('repottingLogs', updatedRepottingLogs);
  
  const soilTopUpLogs = alphaStorage.get('soilTopUpLogs') || [];
  const updatedSoilTopUpLogs = soilTopUpLogs.filter((log: any) => log.plantId !== 1);
  alphaStorage.set('soilTopUpLogs', updatedSoilTopUpLogs);
  
  const pruningLogs = alphaStorage.get('pruningLogs') || [];
  const updatedPruningLogs = pruningLogs.filter((log: any) => log.plantId !== 1);
  alphaStorage.set('pruningLogs', updatedPruningLogs);
  
  console.log('Demo plant and all its care logs have been removed');
}

// Remove user's plant #1 and add demo plant back
export async function restoreDemoPlant(): Promise<void> {
  if (!isAlphaTestingMode()) return;
  
  // Remove any existing plant with plant number 1
  const plants = alphaStorage.get('plants') || [];
  const userPlantWithNumber1 = plants.find((plant: any) => plant.plantNumber === 1);
  
  if (userPlantWithNumber1) {
    // Remove user's plant #1 and all its care logs
    const updatedPlants = plants.filter((plant: any) => plant.id !== userPlantWithNumber1.id);
    alphaStorage.set('plants', updatedPlants);
    
    // Remove all care logs for the user's plant
    const plantId = userPlantWithNumber1.id;
    
    const wateringLogs = alphaStorage.get('wateringLogs') || [];
    const updatedWateringLogs = wateringLogs.filter((log: any) => log.plantId !== plantId);
    alphaStorage.set('wateringLogs', updatedWateringLogs);
    
    const feedingLogs = alphaStorage.get('feedingLogs') || [];
    const updatedFeedingLogs = feedingLogs.filter((log: any) => log.plantId !== plantId);
    alphaStorage.set('feedingLogs', updatedFeedingLogs);
    
    const repottingLogs = alphaStorage.get('repottingLogs') || [];
    const updatedRepottingLogs = repottingLogs.filter((log: any) => log.plantId !== plantId);
    alphaStorage.set('repottingLogs', updatedRepottingLogs);
    
    const soilTopUpLogs = alphaStorage.get('soilTopUpLogs') || [];
    const updatedSoilTopUpLogs = soilTopUpLogs.filter((log: any) => log.plantId !== plantId);
    alphaStorage.set('soilTopUpLogs', updatedSoilTopUpLogs);
    
    const pruningLogs = alphaStorage.get('pruningLogs') || [];
    const updatedPruningLogs = pruningLogs.filter((log: any) => log.plantId !== plantId);
    alphaStorage.set('pruningLogs', updatedPruningLogs);
    
    console.log(`Removed user plant "${userPlantWithNumber1.babyName || userPlantWithNumber1.name}" and all its care logs`);
  }
  
  // Add demo plant back
  try {
    console.log('Restoring demo plant from server...');
    
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
      console.log('Successfully fetched demo plant from server:', serverPlant);
      
      // Add server plant to local storage with alpha mode modifications
      const demoPlant = {
        ...serverPlant,
        id: 1, // Ensure ID is 1 for consistency
        plantNumber: 1, // Ensure plant number is 1
        notes: (serverPlant.notes || '') + '\n\nThis demo plant is shared across all alpha testers and cannot be deleted in alpha mode.'
      };
      
      const currentPlants = alphaStorage.get('plants') || [];
      currentPlants.unshift(demoPlant);
      alphaStorage.set('plants', currentPlants);
      console.log('Demo plant restored to local storage');
    } else {
      console.log('Could not fetch demo plant from server, using fallback');
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
      const currentPlants = alphaStorage.get('plants') || [];
      currentPlants.unshift(fallbackDemoPlant);
      alphaStorage.set('plants', currentPlants);
    }
  } catch (error) {
    console.error('Error restoring demo plant:', error);
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
    const currentPlants = alphaStorage.get('plants') || [];
    currentPlants.unshift(fallbackDemoPlant);
    alphaStorage.set('plants', currentPlants);
  }
}