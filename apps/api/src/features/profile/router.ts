import { Router } from 'express';
import { ProfileService } from './service.js';
import { updateProfileBody } from './schema.js';

export const profileRouter = Router();

profileRouter.get('/', async (req, res, next) => {
  try {
    const profile = await ProfileService.get(req.userId!);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

profileRouter.patch('/', async (req, res, next) => {
  try {
    const data = updateProfileBody.parse(req.body);
    const profile = await ProfileService.update(req.userId!, data);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});
