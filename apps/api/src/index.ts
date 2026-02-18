import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { corsMiddleware, errorHandler, authMiddleware } from './middleware/index.js';
import {
  gamesRouter,
  metricsRouter,
  syncRouter,
  analysisRouter,
  coachRouter,
  profileRouter,
  lichessRouter
} from './features/index.js';
import { openApiDocument } from './docs/index.js';

const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json());

// API docs (no auth)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/games', authMiddleware, gamesRouter);
app.use('/metrics', authMiddleware, metricsRouter);
app.use('/sync', authMiddleware, syncRouter);
app.use('/analysis', authMiddleware, analysisRouter);
app.use('/chat', authMiddleware, coachRouter);
app.use('/profile', authMiddleware, profileRouter);
app.use('/lichess', authMiddleware, lichessRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`API server running on port ${config.PORT}`);
});

export { app };
