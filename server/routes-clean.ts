import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupGoogleAuth } from "./googleAuthRoutes";
import { setupGoogleDriveRoutes } from "./googleDriveRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google Auth for plant storage
  setupGoogleAuth(app);
  
  // Setup Google Drive routes for plant storage  
  setupGoogleDriveRoutes(app);
  
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