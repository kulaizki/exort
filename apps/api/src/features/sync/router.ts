import { Router } from 'express';
import { SyncService } from './service.js';

export const syncRouter = Router();

syncRouter.post('/trigger', async (req, res, next) => {
  try {
    const result = await SyncService.triggerSync(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
