import express from "express";
import { registerRoutes } from "./routes-simple";
import { viteNodeApp } from "./vite";
import session from "express-session";

const app = express();
app.use(express.json());

// Simple session configuration for Google OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

async function startServer() {
  const server = await registerRoutes(app);
  
  // Use Vite's middleware in development
  if (process.env.NODE_ENV === "development") {
    app.use(viteNodeApp);
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);