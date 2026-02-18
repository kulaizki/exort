import { Router } from 'express';
import { GamesService } from './service.js';
import { listGamesQuery, gameIdParam } from './schema.js';

export const gamesRouter = Router();

gamesRouter.get('/', async (req, res, next) => {
  try {
    const query = listGamesQuery.parse(req.query);
    const result = await GamesService.list(req.userId!, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

gamesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = gameIdParam.parse(req.params);
    const game = await GamesService.getById(id, req.userId!);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
});
