import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate the next check date based on watering and feeding frequencies
export function calculateNextCheckDate(
  plant: {
    lastWatered?: string | null;
    lastFed?: string | null;
    wateringFrequencyDays?: number | null;
    feedingFrequencyDays?: number | null;
  },
  newWateringDate?: Date,
  newFeedingDate?: Date
): string {
  const now = new Date();
  const dates: Date[] = [];

  // Calculate next watering date
  const lastWatered = newWateringDate || (plant.lastWatered ? new Date(plant.lastWatered) : null);
  if (lastWatered) {
    const wateringFreq = plant.wateringFrequencyDays || 7;
    const nextWateringDate = new Date(lastWatered.getTime() + (wateringFreq * 24 * 60 * 60 * 1000));
    dates.push(nextWateringDate);
  }

  // Calculate next feeding date
  const lastFed = newFeedingDate || (plant.lastFed ? new Date(plant.lastFed) : null);
  if (lastFed) {
    const feedingFreq = plant.feedingFrequencyDays || 14;
    const nextFeedingDate = new Date(lastFed.getTime() + (feedingFreq * 24 * 60 * 60 * 1000));
    dates.push(nextFeedingDate);
  }

  // Return the earliest of the next dates, or default to 2 days from now if no dates available
  if (dates.length === 0) {
    return new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString();
  }

  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  return earliestDate.toISOString();
}
