import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import gameRouter from "./gameRoutes";

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "dist/public/uploads");
      
      // Create upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register the game API routes under /api/game
  app.use("/api/game", gameRouter);
  
  // Plant API routes
  
  // Get all plants
  app.get("/api/plants", async (req: Request, res: Response) => {
    try {
      const plants = await storage.getPlants();
      res.json(plants);
    } catch (error) {
      console.error("Error fetching plants:", error);
      res.status(500).json({ message: "Error fetching plants" });
    }
  });

  // Get a single plant by id
  app.get("/api/plants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      const plant = await storage.getPlant(id);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }

      res.json(plant);
    } catch (error) {
      console.error("Error fetching plant:", error);
      res.status(500).json({ message: "Error fetching plant" });
    }
  });

  // Create a new plant with image upload
  app.post(
    "/api/plants", 
    upload.single("image"), 
    async (req: Request, res: Response) => {
      try {
        const plantData = req.body;
        
        // Parse string dates if present
        if (plantData.lastWatered) plantData.lastWatered = new Date(plantData.lastWatered);
        if (plantData.nextCheck) plantData.nextCheck = new Date(plantData.nextCheck);
        if (plantData.lastFed) plantData.lastFed = new Date(plantData.lastFed);
        
        // Add image URL if an image was uploaded
        if (req.file) {
          plantData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Get the next plant number for auto-numbering
        const nextPlantNumber = await storage.getNextPlantNumber();
        plantData.plantNumber = nextPlantNumber;

        // Validate plant data
        const result = insertPlantSchema.safeParse(plantData);
        
        if (!result.success) {
          return res.status(400).json({ 
            message: "Invalid plant data", 
            errors: result.error.errors 
          });
        }

        const newPlant = await storage.createPlant(result.data);
        res.status(201).json(newPlant);
      } catch (error) {
        console.error("Error creating plant:", error);
        res.status(500).json({ message: "Error creating plant" });
      }
    }
  );

  // Update a plant
  app.patch(
    "/api/plants/:id", 
    upload.single("image"), 
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid plant ID" });
        }

        const plantData = req.body;
        
        // Add image URL if an image was uploaded
        if (req.file) {
          plantData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedPlant = await storage.updatePlant(id, plantData);
        if (!updatedPlant) {
          return res.status(404).json({ message: "Plant not found" });
        }

        res.json(updatedPlant);
      } catch (error) {
        console.error("Error updating plant:", error);
        res.status(500).json({ message: "Error updating plant" });
      }
    }
  );

  // Delete a plant
  app.delete("/api/plants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      const deleted = await storage.deletePlant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Plant not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plant:", error);
      res.status(500).json({ message: "Error deleting plant" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
