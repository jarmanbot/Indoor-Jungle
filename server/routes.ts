import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlantSchema, 
  insertCustomLocationSchema,
  insertWateringLogSchema,
  insertFeedingLogSchema,
  insertSeasonalRecommendationSchema,
  insertPlantRecommendationSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import gameRouter from "./gameRoutes";

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Use public/uploads for static file serving
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
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

  // Create a new plant - JSON method
  app.post("/api/plants/json", express.json(), async (req: Request, res: Response) => {
      try {
        console.log("Received plant data (JSON):", req.body);
        const plantData = req.body;
        
        // Get the next plant number for auto-numbering
        const nextPlantNumber = await storage.getNextPlantNumber();
        plantData.plantNumber = nextPlantNumber;
        
        // Set name field from babyName for backward compatibility
        if (plantData.babyName && !plantData.name) {
          plantData.name = plantData.babyName;
        }

        // Convert date strings to Date objects
        if (plantData.lastWatered && typeof plantData.lastWatered === 'string') {
          plantData.lastWatered = new Date(plantData.lastWatered);
        }
        if (plantData.nextCheck && typeof plantData.nextCheck === 'string') {
          plantData.nextCheck = new Date(plantData.nextCheck);
        }
        if (plantData.lastFed && typeof plantData.lastFed === 'string') {
          plantData.lastFed = new Date(plantData.lastFed);
        }
        
        console.log("Plant data to validate:", plantData);
        
        // Validate plant data
        const result = insertPlantSchema.safeParse(plantData);
        
        if (!result.success) {
          console.error("Validation errors:", result.error.errors);
          return res.status(400).json({ 
            message: "Invalid plant data", 
            errors: result.error.errors 
          });
        }

        const newPlant = await storage.createPlant(result.data);
        res.status(201).json(newPlant);
      } catch (error) {
        console.error("Error creating plant with JSON:", error);
        res.status(500).json({ message: "Error creating plant" });
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
        
        // Set name field from babyName for backward compatibility
        if (plantData.babyName && !plantData.name) {
          plantData.name = plantData.babyName;
        }

        // Convert date strings to Date objects
        if (plantData.lastWatered && typeof plantData.lastWatered === 'string') {
          plantData.lastWatered = new Date(plantData.lastWatered);
        }
        if (plantData.nextCheck && typeof plantData.nextCheck === 'string') {
          plantData.nextCheck = new Date(plantData.nextCheck);
        }
        if (plantData.lastFed && typeof plantData.lastFed === 'string') {
          plantData.lastFed = new Date(plantData.lastFed);
        }
        
        console.log("Plant data to validate:", plantData);
        
        // Validate plant data
        const result = insertPlantSchema.safeParse(plantData);
        
        if (!result.success) {
          console.error("Validation errors:", result.error.errors);
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
        
        // Set name field from babyName for backward compatibility
        if (plantData.babyName && !plantData.name) {
          plantData.name = plantData.babyName;
        }
        
        // Convert date strings to Date objects for update
        if (plantData.lastWatered && typeof plantData.lastWatered === 'string') {
          plantData.lastWatered = new Date(plantData.lastWatered);
        }
        if (plantData.nextCheck && typeof plantData.nextCheck === 'string') {
          plantData.nextCheck = new Date(plantData.nextCheck);
        }
        if (plantData.lastFed && typeof plantData.lastFed === 'string') {
          plantData.lastFed = new Date(plantData.lastFed);
        }
        
        console.log("Update plant data:", plantData);

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

  // -------------------- Custom Location API Routes --------------------

  // Get all custom locations
  app.get("/api/locations", async (req: Request, res: Response) => {
    try {
      const locations = await storage.getCustomLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching custom locations:", error);
      res.status(500).json({ message: "Error fetching custom locations" });
    }
  });

  // Create a new custom location
  app.post("/api/locations", express.json(), async (req: Request, res: Response) => {
    try {
      const locationData = req.body;
      
      // Validate location data
      const result = insertCustomLocationSchema.safeParse(locationData);
      
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid location data", 
          errors: result.error.errors 
        });
      }

      const newLocation = await storage.createCustomLocation(result.data);
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating custom location:", error);
      res.status(500).json({ message: "Error creating custom location" });
    }
  });

  // Delete a custom location
  app.delete("/api/locations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }

      const deleted = await storage.deleteCustomLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting custom location:", error);
      res.status(500).json({ message: "Error deleting custom location" });
    }
  });

  // -------------------- Plant Care Logs API Routes --------------------

  // Get watering logs for a plant
  app.get("/api/plants/:id/watering-logs", async (req: Request, res: Response) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      const logs = await storage.getWateringLogs(plantId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching watering logs:", error);
      res.status(500).json({ message: "Error fetching watering logs" });
    }
  });

  // Add a watering log
  app.post("/api/plants/:id/watering-logs", express.json(), async (req: Request, res: Response) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      // Combine request data with plant ID
      const logData = {
        ...req.body,
        plantId
      };

      // Validate log data
      const result = insertWateringLogSchema.safeParse(logData);
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid watering log data", 
          errors: result.error.errors 
        });
      }

      const newLog = await storage.addWateringLog(result.data);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error adding watering log:", error);
      res.status(500).json({ message: "Error adding watering log" });
    }
  });

  // Get feeding logs for a plant
  app.get("/api/plants/:id/feeding-logs", async (req: Request, res: Response) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      const logs = await storage.getFeedingLogs(plantId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching feeding logs:", error);
      res.status(500).json({ message: "Error fetching feeding logs" });
    }
  });

  // Add a feeding log
  app.post("/api/plants/:id/feeding-logs", express.json(), async (req: Request, res: Response) => {
    try {
      const plantId = parseInt(req.params.id);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID" });
      }

      // Combine request data with plant ID
      const logData = {
        ...req.body,
        plantId
      };

      // Validate log data
      const result = insertFeedingLogSchema.safeParse(logData);
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid feeding log data", 
          errors: result.error.errors 
        });
      }

      const newLog = await storage.addFeedingLog(result.data);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error adding feeding log:", error);
      res.status(500).json({ message: "Error adding feeding log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
