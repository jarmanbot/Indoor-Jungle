import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { firebaseStorage } from "./firebaseStorageClean";

// Simple middleware for Firebase-based authentication (no PostgreSQL required)
const requireAuth = (req: any, res: Response, next: any) => {
  // For development, allow any user ID in the request headers
  const userId = req.headers['x-user-id'] || 'anonymous';
  req.userId = userId;
  next();
};

export async function registerFirebaseRoutes(app: Express): Promise<Server> {
  // Simple auth route for development
  app.get('/api/auth/user', (req, res) => {
    // For development, return a mock user
    res.json({
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Development User'
    });
  });

  // Plants routes
  app.get('/api/plants', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plants = await firebaseStorage.getPlants(userId);
      res.json(plants);
    } catch (error) {
      console.error("Error fetching plants:", error);
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  app.get('/api/plants/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
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

  app.post('/api/plants', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      
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

  app.put('/api/plants/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plantId = req.params.id;
      
      const plant = await firebaseStorage.updatePlant(userId, plantId, req.body);
      res.json(plant);
    } catch (error) {
      console.error("Error updating plant:", error);
      res.status(500).json({ message: "Failed to update plant" });
    }
  });

  app.delete('/api/plants/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
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
    app.get(`/api/plants/:plantId/${logType}-logs`, requireAuth, async (req: any, res) => {
      try {
        const userId = req.userId || 'dev-user';
        const plantId = req.params.plantId;
        
        const logs = await firebaseStorage.getCareLogsForPlant(userId, plantId, `${logType}Logs`);
        res.json(logs);
      } catch (error) {
        console.error(`Error fetching ${logType} logs:`, error);
        res.status(500).json({ message: `Failed to fetch ${logType} logs` });
      }
    });

    // Add care log
    app.post(`/api/plants/:plantId/${logType}-logs`, requireAuth, async (req: any, res) => {
      try {
        const userId = req.userId || 'dev-user';
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

  // Migration routes
  app.get('/api/migration/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plants = await firebaseStorage.getPlants(userId);
      
      res.json({
        migrationNeeded: plants.length === 0,
        plantsInFirebase: plants.length,
      });
    } catch (error) {
      console.error("Error checking migration status:", error);
      res.status(500).json({ message: "Failed to check migration status" });
    }
  });

  app.post('/api/migration/migrate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const { data } = req.body;
      
      if (!data || !data.plants) {
        return res.status(400).json({ message: "Invalid migration data" });
      }

      // Migrate plants
      for (const plant of data.plants) {
        await firebaseStorage.createPlant(userId, { ...plant, userId });
      }

      // Migrate care logs
      const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
      for (const logType of logTypes) {
        if (data[logType] && Array.isArray(data[logType])) {
          for (const log of data[logType]) {
            await firebaseStorage.addCareLog(userId, logType, { ...log, userId });
          }
        }
      }

      res.json({ success: true, message: "Migration completed successfully" });
    } catch (error) {
      console.error("Error during migration:", error);
      res.status(500).json({ message: "Migration failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}