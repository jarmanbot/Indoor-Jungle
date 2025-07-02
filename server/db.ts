import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
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

// Function to test database connection
export async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Simple test query
    const result = await db.execute(/* sql */`SELECT 1 as test`);
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}