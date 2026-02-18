import 'dotenv/config';
import express from 'express';
import { config } from './config/index.js';
import { SyncService } from './sync/service.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/sync/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await SyncService.syncUser(userId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.listen(config.PORT, () => {
  console.log(`Sync service running on port ${config.PORT}`);
});

export { app };
