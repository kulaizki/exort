import { Router } from 'express';
import { LichessService } from './service.js';
import { z } from 'zod';

const connectBody = z.object({
  lichessUsername: z.string().min(1).max(50)
});

export const lichessRouter = Router();

lichessRouter.post('/connect', async (req, res, next) => {
  try {
    const { lichessUsername } = connectBody.parse(req.body);
    const account = await LichessService.connect(req.userId!, lichessUsername);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});

lichessRouter.delete('/disconnect', async (req, res, next) => {
  try {
    const result = await LichessService.disconnect(req.userId!);
    if (!result) {
      res.status(404).json({ error: 'No Lichess account connected' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
