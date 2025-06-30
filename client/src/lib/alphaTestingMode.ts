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

// Initialize alpha testing mode - no demo plant, let users start fresh with plant #1
export function initializeAlphaMode(): void {
  if (!isAlphaTestingMode()) return;
  
  // Simply ensure the plants array exists, but don't add any demo plant
  const plants = alphaStorage.get('plants');
  if (!plants) {
    alphaStorage.set('plants', []);
  }
}