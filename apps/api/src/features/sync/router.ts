import { Router } from 'express';
import { SyncService } from './service.js';

export const syncRouter = Router();

syncRouter.post('/trigger', async (req, res) => {
  try {
    const result = await SyncService.triggerSync(req.userId!);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    console.error('Sync trigger error:', message);
    res.status(502).json({ error: message });
  }
});
