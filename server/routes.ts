import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth } from "./googleAuthRoutes";
import { setupGoogleDriveRoutes } from "./googleDriveRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google Auth for plant storage
  setupGoogleAuth(app);
  
  // Setup Google Drive routes for plant storage  
  setupGoogleDriveRoutes(app);
  
  // Backup download endpoint
  app.post('/api/backup/download', (req, res) => {
    try {
      const { data, filename } = req.body;
      
      if (!data || !filename) {
        return res.status(400).json({ error: 'Missing data or filename' });
      }
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(data, 'utf8'));
      
      // Send the data as downloadable file
      res.send(data);
    } catch (error) {
      console.error('Backup download error:', error);
      res.status(500).json({ error: 'Failed to create backup download' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Indoor Jungle server running with Google Drive storage',
      storage: 'google-drive'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}