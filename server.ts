import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/db/store';
import { seedInitialDatabase } from './server/seed/seedData';
import { errorHandler } from './server/middleware/errorMiddleware';

import authRoutes from './server/routes/authRoutes';
import incidentRoutes from './server/routes/incidentRoutes';
import adminRoutes from './server/routes/adminRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import notificationRoutes from './server/routes/notificationRoutes';
import emergencyRoutes from './server/routes/emergencyRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize DB & Seed Data
  await dbStore.connectMongo();
  await seedInitialDatabase();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/emergency-services', emergencyRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SafeCity AI API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // AI Direct Test endpoint
  app.post('/api/ai/analyze-incident', async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const { analyzeIncidentWithGemini } = await import('./server/services/geminiService');
      const result = await analyzeIncidentWithGemini(title, description, category);
      res.json({ success: true, analysis: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Centralized Error Handler for API
  app.use(errorHandler);

  // Vite Middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` SafeCity AI Server Running on http://0.0.0.0:${PORT} `);
    console.log(` Intelligent Community Safety & Incident Reporting Platform`);
    console.log(`=======================================================`);
  });
}

startServer();
