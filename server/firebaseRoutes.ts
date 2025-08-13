import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { firebaseStorage } from "./firebaseStorageClean";
import { setupAuth, isAuthenticated } from "./replitAuth";
// Firebase route validation will be done inline

export async function registerFirebaseRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Plants routes
  app.get('/api/plants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plants = await firebaseStorage.getPlants(userId);
      res.json(plants);
    } catch (error) {
      console.error("Error fetching plants:", error);
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  app.get('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plantId = req.params.id;
      const plant = await firebaseStorage.getPlant(userId, plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      res.json(plant);
    } catch (error) {
      console.error("Error fetching plant:", error);
      res.status(500).json({ message: "Failed to fetch plant" });
    }
  });

  app.post('/api/plants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Basic validation - Firebase will handle the rest
      if (!req.body.name) {
        return res.status(400).json({ message: "Plant name is required" });
      }

      const plant = await firebaseStorage.createPlant(userId, {
        ...req.body,
        userId,
      });
      res.status(201).json(plant);
    } catch (error) {
      console.error("Error creating plant:", error);
      res.status(500).json({ message: "Failed to create plant" });
    }
  });

  app.put('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plantId = req.params.id;
      
      const plant = await firebaseStorage.updatePlant(userId, plantId, req.body);
      res.json(plant);
    } catch (error) {
      console.error("Error updating plant:", error);
      res.status(500).json({ message: "Failed to update plant" });
    }
  });

  app.delete('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plantId = req.params.id;
      
      await firebaseStorage.deletePlant(userId, plantId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plant:", error);
      res.status(500).json({ message: "Failed to delete plant" });
    }
  });

  // Care logs routes
  const careLogTypes = ['watering', 'feeding', 'repotting', 'soilTopUp', 'pruning'];
  
  careLogTypes.forEach(logType => {
    // Get care logs for a plant
    app.get(`/api/plants/:plantId/${logType}-logs`, isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const plantId = req.params.plantId;
        
        const logs = await firebaseStorage.getCareLogsForPlant(userId, plantId, `${logType}Logs`);
        res.json(logs);
      } catch (error) {
        console.error(`Error fetching ${logType} logs:`, error);
        res.status(500).json({ message: `Failed to fetch ${logType} logs` });
      }
    });

    // Add care log
    app.post(`/api/plants/:plantId/${logType}-logs`, isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const plantId = req.params.plantId;
        
        const logData = {
          ...req.body,
          plantId,
          userId,
          date: req.body.date ? new Date(req.body.date) : new Date(),
        };

        const log = await firebaseStorage.addCareLog(userId, `${logType}Logs`, logData);
        res.status(201).json(log);
      } catch (error) {
        console.error(`Error adding ${logType} log:`, error);
        res.status(500).json({ message: `Failed to add ${logType} log` });
      }
    });
  });

  // User routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await firebaseStorage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await firebaseStorage.createUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Migration routes
  app.get('/api/migrate/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plants = await firebaseStorage.getPlants(userId);
      
      // If user has plants in Firebase, they've migrated
      const migrationNeeded = plants.length === 0;
      
      res.json({ migrationNeeded });
    } catch (error) {
      console.error("Error checking migration status:", error);
      res.status(500).json({ message: "Failed to check migration status" });
    }
  });

  app.post('/api/migrate/from-localstorage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { localStorageData } = req.body;
      
      let plantsCreated = 0;
      let logsCreated = 0;
      
      // Migrate plants
      for (const localPlant of localStorageData.plants || []) {
        try {
          await firebaseStorage.createPlant(userId, {
            name: localPlant.name || 'Unknown Plant',
            userId,
            babyName: localPlant.babyName || '',
            commonName: localPlant.commonName || '',
            latinName: localPlant.latinName || null,
            location: localPlant.location || 'living_room',
            lastWatered: localPlant.lastWatered ? new Date(localPlant.lastWatered) : null,
            lastFed: localPlant.lastFed ? new Date(localPlant.lastFed) : null,
            nextCheck: localPlant.nextCheck ? new Date(localPlant.nextCheck) : null,
            wateringFrequencyDays: localPlant.wateringFrequencyDays || 7,
            feedingFrequencyDays: localPlant.feedingFrequencyDays || 14,
            notes: localPlant.notes || null,
            imageUrl: localPlant.imageUrl || null,
            status: localPlant.status || 'healthy',
          });
          plantsCreated++;
        } catch (error) {
          console.error('Error migrating plant:', error);
        }
      }

      // Migrate care logs
      const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
      for (const logType of logTypes) {
        const logs = localStorageData[logType] || [];
        for (const log of logs) {
          try {
            await firebaseStorage.addCareLog(userId, logType, {
              plantId: log.plantId?.toString() || '',
              userId,
              date: log.date ? new Date(log.date) : new Date(),
              notes: log.notes || null,
            });
            logsCreated++;
          } catch (error) {
            console.error(`Error migrating ${logType} log:`, error);
          }
        }
      }

      res.json({
        success: true,
        plantsCreated,
        logsCreated,
        imagesUploaded: 0, // Images will be uploaded separately
      });
    } catch (error) {
      console.error("Error migrating from localStorage:", error);
      res.status(500).json({ message: "Migration failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}