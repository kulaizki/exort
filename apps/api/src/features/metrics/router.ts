import { Router } from 'express';
import { MetricsService } from './service.js';

export const metricsRouter = Router();

metricsRouter.get('/summary', async (req, res, next) => {
  try {
    const summary = await MetricsService.getSummary(req.userId!);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

metricsRouter.get('/trends', async (req, res, next) => {
  try {
    const trends = await MetricsService.getTrends(req.userId!);
    res.json(trends);
  } catch (err) {
    next(err);
  }
});
