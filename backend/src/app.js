// backend/src/app.js

// builds and exports the configured Express app WITHOUT connecting to the
// database or starting a listener. index.js wires up the DB + server for
// production; tests import this app directly and supply their own database.

// imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import signupRoutes from './routes/signup.js';
import applicationsRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';

// create the express app
export function createApp() {
  const app = express();

  // security headers. crossOriginResourcePolicy is relaxed to 'cross-origin'
  // because this is a JSON API consumed by a separately-hosted frontend.
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // CORS: in production CORS_ORIGIN must list the real frontend origin(s). The
  // allow-all fallback (origin: true) only applies when CORS_ORIGIN is unset,
  // which should be local development only.
  app.use(cors({
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
  }));

  // middleware to parse JSON requests
  app.use(express.json());

  // mount routes
  app.use('/applications', applicationsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/', signupRoutes);

  return app;
}

export default createApp;
