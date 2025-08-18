import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { mockFirebaseStorage } from "./mockFirebaseStorage";
import { writeFileSync } from 'fs';
import { join } from 'path';

// Automatic backup function
async function createBackup(userId: string, trigger: string) {
  try {
    const plants = await mockFirebaseStorage.getPlants(userId);
    
    const backup = {
      plants,
      metadata: {
        exportDate: new Date().toISOString(),
        userId,
        trigger,
        totalPlants: plants.length
      }
    };

    const backupPath = join(process.cwd(), 'public', `firebase_backup_${userId}_${Date.now()}.json`);
    writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`Auto-backup created: ${backupPath} (${trigger})`);
  } catch (error) {
    console.error('Failed to create backup:', error);
  }
}

// Simple middleware for Firebase-based authentication (no PostgreSQL required)
const requireAuth = (req: any, res: Response, next: any) => {
  // For development, allow any user ID in the request headers or use dev-user as default
  const userId = req.headers['x-user-id'] || req.user?.id || 'dev-user';
  req.userId = userId;
  console.log('Auth middleware - Using userId:', userId);
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
      const plants = await mockFirebaseStorage.getPlants(userId);
      // Ensure all plants have plant numbers for display
      const plantsWithNumbers = plants.map((plant, index) => ({
        ...plant,
        plantNumber: plant.plantNumber || (index + 1)
      }));
      res.json(plantsWithNumbers);
    } catch (error) {
      console.error("Error fetching plants:", error);
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  app.get('/api/plants/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plantId = req.params.id;
      const plant = await mockFirebaseStorage.getPlant(userId, plantId);
      
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
      
      // Basic validation
      if (!req.body.name) {
        return res.status(400).json({ message: "Plant name is required" });
      }

      const plant = await mockFirebaseStorage.createPlant(userId, {
        ...req.body,
        userId,
      });
      
      // Create automatic JSON backup after adding plant
      await createBackup(userId, 'plant_added');
      
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
      
      const plant = await mockFirebaseStorage.updatePlant(userId, plantId, req.body);
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
      
      await mockFirebaseStorage.deletePlant(userId, plantId);
      
      // Create automatic JSON backup after deletion
      await createBackup(userId, 'plant_deleted');
      
      res.json({ success: true, message: "Plant deleted successfully" });
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
        
        const logs = await mockFirebaseStorage.getCareLogsForPlant(userId, plantId, `${logType}Logs`);
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

        const log = await mockFirebaseStorage.addCareLog(userId, `${logType}Logs`, logData);
        res.status(201).json(log);
      } catch (error) {
        console.error(`Error adding ${logType} log:`, error);
        res.status(500).json({ message: `Failed to add ${logType} log` });
      }
    });
  });

  // Firebase testing routes
  app.get('/api/firebase/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plants = await mockFirebaseStorage.getPlants(userId);
      const counts = mockFirebaseStorage.getTotalCounts();
      
      res.json({
        status: 'active',
        userId: userId,
        userPlants: plants.length,
        totalCounts: counts,
        message: 'Firebase backend is operational'
      });
    } catch (error) {
      console.error("Error checking Firebase status:", error);
      res.status(500).json({ message: "Failed to check Firebase status" });
    }
  });

  app.post('/api/migration/migrate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const { data } = req.body;
      
      if (!data || !data.plants) {
        return res.status(400).json({ message: "Invalid migration data" });
      }

      // Clear existing data first to prevent duplicates
      await mockFirebaseStorage.clearAllData(userId);
      
      // Migrate plants
      for (const plant of data.plants) {
        await mockFirebaseStorage.createPlant(userId, { ...plant, userId });
      }

      // Migrate care logs
      const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
      for (const logType of logTypes) {
        if (data[logType] && Array.isArray(data[logType])) {
          for (const log of data[logType]) {
            await mockFirebaseStorage.addCareLog(userId, logType, { ...log, userId });
          }
        }
      }

      res.json({ success: true, message: "Migration completed successfully" });
    } catch (error) {
      console.error("Error during migration:", error);
      res.status(500).json({ message: "Migration failed" });
    }
  });

  // Demo plant toggle endpoint
  app.post('/api/demo-plant/toggle', requireAuth, async (req: any, res) => {
    try {
      const { enabled } = req.body;
      const userId = req.userId || 'dev-user';
      
      if (enabled) {
        // Check if demo plant already exists
        const plants = await mockFirebaseStorage.getPlants(userId);
        const existingDemo = plants.find(p => 
          p.babyName === 'Demo Plant' && 
          p.notes?.includes('This is your demo plant to explore the app!')
        );
        
        if (existingDemo) {
          res.json({ success: true, message: 'Demo plant already exists' });
          return;
        }
        
        // Add demo plant
        const demoPlant = {
          id: 1,
          plantNumber: 1,
          babyName: 'Demo Plant',
          commonName: 'Sample Houseplant',
          latinName: 'Plantus Demonstratus',
          name: 'Demo Plant',
          location: 'living_room',
          lastWatered: null,
          nextCheck: null,
          lastFed: null,
          wateringFrequencyDays: 7,
          feedingFrequencyDays: 14,
          notes: 'This is your demo plant to explore the app! You can delete it and add your own plants.',
          imageUrl: '/demo-plant.gif',
          status: 'healthy',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId
        };
        
        await mockFirebaseStorage.createPlant(userId, demoPlant);
        res.json({ success: true, message: 'Demo plant added successfully' });
      } else {
        // Remove demo plant
        const plants = await mockFirebaseStorage.getPlants(userId);
        const demoPlant = plants.find(p => 
          p.babyName === 'Demo Plant' && 
          p.notes?.includes('This is your demo plant to explore the app!')
        );
        
        if (demoPlant) {
          await mockFirebaseStorage.deletePlant(userId, demoPlant.id!);
        }
        
        res.json({ success: true, message: 'Demo plant removed successfully' });
      }
    } catch (error) {
      console.error('Error toggling demo plant:', error);
      res.status(500).json({ error: 'Failed to toggle demo plant' });
    }
  });

  // Demo plant status endpoint
  app.get('/api/demo-plant/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plants = await mockFirebaseStorage.getPlants(userId);
      const hasDemo = plants.some(p => 
        p.babyName === 'Demo Plant' && 
        p.notes?.includes('This is your demo plant to explore the app!')
      );
      
      res.json({ enabled: hasDemo });
    } catch (error) {
      console.error('Error checking demo plant status:', error);
      res.status(500).json({ error: 'Failed to check demo plant status' });
    }
  });

  // Debug endpoint to clear all data
  app.delete('/api/debug/clear-all-data', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      await mockFirebaseStorage.clearAllData(userId);
      res.json({ success: true, message: 'All data cleared successfully' });
    } catch (error) {
      console.error('Error clearing data:', error);
      res.status(500).json({ error: 'Failed to clear data' });
    }
  });

  // Manual backup endpoint
  app.post('/api/backup/create', requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId || 'dev-user';
      const plants = await mockFirebaseStorage.getPlants(userId);
      
      const backup = {
        plants,
        metadata: {
          exportDate: new Date().toISOString(),
          userId,
          trigger: 'manual_backup',
          totalPlants: plants.length
        }
      };

      const filename = `manual_backup_${userId}_${Date.now()}.json`;
      const backupPath = join(process.cwd(), 'public', filename);
      writeFileSync(backupPath, JSON.stringify(backup, null, 2));
      
      console.log(`Manual backup created: ${backupPath}`);
      
      res.json({ 
        success: true, 
        message: 'Backup created successfully',
        filename,
        downloadUrl: `/public/${filename}`,
        totalPlants: plants.length
      });
    } catch (error) {
      console.error('Failed to create manual backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}