import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

// Validate that the database URL is provided
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create the database pool and client
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10 // Set connection pool size
});

// Create the drizzle client with our schema
export const db = drizzle({ client: pool, schema });

// Function to run migrations on startup if needed
export async function runMigrations() {
  try {
    console.log("Checking database schema...");
    
    // Create missing tables if any
    await db.execute(/* sql */`
      -- Create the plant_status enum type if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plant_status') THEN
          CREATE TYPE plant_status AS ENUM ('healthy', 'check_soon', 'needs_water', 'unhealthy');
        END IF;
      END $$;
      
      -- Create the custom_locations table if it doesn't exist
      CREATE TABLE IF NOT EXISTS custom_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Add any missing columns to the plants table
      DO $$ 
      BEGIN
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'plants' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE plants ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        END IF;
      END $$;
    `);
    
    console.log("Database schema is up to date.");
  } catch (error) {
    console.error("Error updating database schema:", error);
    throw error;
  }
}