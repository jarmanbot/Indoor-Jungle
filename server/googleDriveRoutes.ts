import type { Express } from "express";
import multer from 'multer';
import GoogleDriveService from './googleDriveService';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export function setupGoogleDriveRoutes(app: Express) {
  
  // Get all plants data
  app.get('/api/plants', async (req, res) => {
    try {
      const tokens = (req.session as any)?.googleTokens;
      if (!tokens?.access_token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const driveService = new GoogleDriveService(tokens.access_token);
      const folderId = await driveService.ensureAppFolder();
      const plantData = await driveService.loadPlantData(folderId);
      
      res.json(plantData.plants || []);
    } catch (error) {
      console.error('Error loading plants:', error);
      res.status(500).json({ error: 'Failed to load plants from Google Drive' });
    }
  });

  // Save all plants data
  app.post('/api/plants/sync', async (req, res) => {
    try {
      const tokens = (req.session as any)?.googleTokens;
      if (!tokens?.access_token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { plants, logs } = req.body;
      
      const driveService = new GoogleDriveService(tokens.access_token);
      const folderId = await driveService.ensureAppFolder();
      
      await driveService.savePlantData({ plants, logs }, folderId);
      
      res.json({ message: 'Plant data synced to Google Drive successfully' });
    } catch (error) {
      console.error('Error syncing plants:', error);
      res.status(500).json({ error: 'Failed to sync plants to Google Drive' });
    }
  });

  // Upload plant image
  app.post('/api/plants/upload-image', upload.single('image'), async (req, res) => {
    try {
      const tokens = (req.session as any)?.googleTokens;
      if (!tokens?.access_token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const driveService = new GoogleDriveService(tokens.access_token);
      const folderId = await driveService.ensureAppFolder();
      
      const imageName = `plant_${Date.now()}.jpg`;
      const imageUrl = await driveService.uploadPlantImage(
        req.file.buffer, 
        imageName, 
        folderId
      );
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image to Google Drive' });
    }
  });

  // Delete plant image
  app.delete('/api/plants/delete-image', async (req, res) => {
    try {
      const tokens = (req.session as any)?.googleTokens;
      if (!tokens?.access_token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { imageUrl } = req.body;
      
      const driveService = new GoogleDriveService(tokens.access_token);
      await driveService.deletePlantImage(imageUrl);
      
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Failed to delete image from Google Drive' });
    }
  });

  // Get care logs for a specific plant
  app.get('/api/plants/:plantId/logs', async (req, res) => {
    try {
      const tokens = (req.session as any)?.googleTokens;
      if (!tokens?.access_token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { plantId } = req.params;
      
      const driveService = new GoogleDriveService(tokens.access_token);
      const folderId = await driveService.ensureAppFolder();
      const plantData = await driveService.loadPlantData(folderId);
      
      const logs = plantData.logs?.[plantId] || {
        watering: [],
        feeding: [],
        repotting: [],
        soilTopUp: [],
        pruning: []
      };
      
      res.json(logs);
    } catch (error) {
      console.error('Error loading care logs:', error);
      res.status(500).json({ error: 'Failed to load care logs from Google Drive' });
    }
  });
}