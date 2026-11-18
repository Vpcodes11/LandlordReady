import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { initDatabase } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Database & Seed data
initDatabase();

// Serve uploaded document files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'LandlordReady Compliance Engine',
    version: '1.0.0',
    jurisdiction: 'England',
    renters_rights_act_phase: 'Phase 1 (1 May 2026)',
    time: new Date().toISOString()
  });
});

// Serve frontend in production build if present
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexHtml = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
    next();
  });
}

const server = app.listen(PORT, () => {
  console.log(`🚀 LandlordReady server listening on http://localhost:${PORT}`);
});

export { app, server };
