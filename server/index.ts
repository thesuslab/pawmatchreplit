import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { WebSocketServer } from 'ws';

// These two lines are needed if you're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const payloadLimit = process.env.PAYLOAD_LIMIT_MB ? `${process.env.PAYLOAD_LIMIT_MB}mb` : '2mb';
app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: false, limit: payloadLimit }));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  return mailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

(async () => {
  const server = await registerRoutes(app);

  /*
  // --- WebSocket server setup ---
  const wss = new WebSocketServer({ server });
  // Map to track userId -> ws connection
  const userConnections = new Map();

  wss.on('connection', (ws, req) => {
    // For now, expect userId as a query param (e.g., ws://host:5000?userId=123)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    if (userId) {
      userConnections.set(userId, ws);
      ws.on('close', () => {
        userConnections.delete(userId);
      });
    }
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established.' }));
  });

  // Make available for notification logic
  app.set('wss', wss);
  app.set('userConnections', userConnections);
  // --- End WebSocket server setup ---
  */

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, async () => {
    log(`serving on port ${port}`);
    log('APP is running on  http://localhost:5000')
    
    // Seed the database on startup in development
    if (app.get("env") === "development") {
      try {
        await seedDatabase();
        log("Database not seededsuccessfully");
        // log("Database seeded successfully");
      } catch (error) {
        log("Database seeding failed: " + String(error));
      }
    }
  });

  // Move this catch-all route to the very end
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API route not found' });
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
})();
