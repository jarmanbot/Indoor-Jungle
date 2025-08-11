import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import type { InsertPlant, InsertWateringLog, InsertFeedingLog, InsertRepottingLog, InsertSoilTopUpLog, InsertPruningLog } from "@shared/schema";

interface LocalStorageData {
  plants: any[];
  customLocations: string[];
  wateringLogs: any[];
  feedingLogs: any[];
  repottingLogs: any[];
  soilTopUpLogs: any[];
  pruningLogs: any[];
}

export class MigrationService {
  private objectStorage = new ObjectStorageService();

  async migrateFromLocalStorage(data: LocalStorageData, userId: string): Promise<{
    plantsCreated: number;
    logsCreated: number;
    imagesUploaded: number;
  }> {
    let plantsCreated = 0;
    let logsCreated = 0;
    let imagesUploaded = 0;

    try {
      // First, migrate custom locations
      for (const locationName of data.customLocations || []) {
        try {
          await storage.createCustomLocation({ name: locationName });
        } catch (error) {
          // Location might already exist, continue
          console.warn(`Custom location '${locationName}' already exists or failed to create`);
        }
      }

      // Migrate plants
      const plantIdMapping: { [oldId: number]: number } = {};
      
      for (const localPlant of data.plants || []) {
        try {
          // Handle image migration if plant has an image
          let imageUrl: string | undefined;
          if (localPlant.imageUrl && localPlant.imageUrl.startsWith('data:')) {
            try {
              imageUrl = await this.uploadBase64Image(localPlant.imageUrl);
              imagesUploaded++;
            } catch (error) {
              console.error('Failed to upload image for plant:', localPlant.babyName, error);
              // Continue without image rather than failing the whole migration
            }
          }

          // Create plant data for database
          const plantData: InsertPlant = {
            userId,
            plantNumber: localPlant.plantNumber || plantsCreated + 1,
            babyName: localPlant.babyName || localPlant.name || `Plant ${plantsCreated + 1}`,
            commonName: localPlant.commonName || localPlant.name || localPlant.babyName || '',
            latinName: localPlant.latinName || null,
            name: localPlant.name || localPlant.babyName || `Plant ${plantsCreated + 1}`,
            location: localPlant.location || 'living_room',
            lastWatered: localPlant.lastWatered ? new Date(localPlant.lastWatered) : null,
            nextCheck: localPlant.nextCheck ? new Date(localPlant.nextCheck) : null,
            lastFed: localPlant.lastFed ? new Date(localPlant.lastFed) : null,
            wateringFrequencyDays: localPlant.wateringFrequencyDays || 7,
            feedingFrequencyDays: localPlant.feedingFrequencyDays || 14,
            notes: localPlant.notes || null,
            imageUrl: imageUrl || null,
            status: localPlant.status || 'healthy',
          };

          const newPlant = await storage.createPlant(plantData);
          plantIdMapping[localPlant.id] = newPlant.id;
          plantsCreated++;

        } catch (error) {
          console.error('Failed to migrate plant:', localPlant.babyName, error);
          // Continue with other plants
        }
      }

      // Migrate care logs
      const logTypes = [
        { logs: data.wateringLogs || [], addFn: storage.addWateringLog.bind(storage) },
        { logs: data.feedingLogs || [], addFn: storage.addFeedingLog.bind(storage) },
        { logs: data.repottingLogs || [], addFn: storage.addRepottingLog.bind(storage) },
        { logs: data.soilTopUpLogs || [], addFn: storage.addSoilTopUpLog.bind(storage) },
        { logs: data.pruningLogs || [], addFn: storage.addPruningLog.bind(storage) },
      ];

      for (const { logs, addFn } of logTypes) {
        for (const log of logs) {
          const newPlantId = plantIdMapping[log.plantId];
          if (!newPlantId) {
            console.warn('Skipping log for unknown plant ID:', log.plantId);
            continue;
          }

          try {
            const logData = {
              plantId: newPlantId,
              date: new Date(log.date),
              notes: log.notes || null,
            };

            await addFn(logData);
            logsCreated++;
          } catch (error) {
            console.error('Failed to migrate log:', error);
            // Continue with other logs
          }
        }
      }

      return { plantsCreated, logsCreated, imagesUploaded };

    } catch (error) {
      console.error('Migration failed:', error);
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async uploadBase64Image(base64Data: string): Promise<string> {
    // Convert base64 to blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Get upload URL
    const { uploadURL, objectPath } = await this.objectStorage.getPlantImageUploadURL();
    
    // Upload to object storage
    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.status}`);
    }

    return objectPath;
  }

  async checkMigrationNeeded(): Promise<boolean> {
    // Check if there are any plants in the database
    const plants = await storage.getPlants();
    return plants.length === 0;
  }
}

export const migrationService = new MigrationService();