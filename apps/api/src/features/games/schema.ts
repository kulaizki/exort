import { z } from 'zod';

export const listGamesQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  timeControl: z.string().optional(),
  result: z.string().optional(),
  opening: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(['date', 'accuracy', 'blunders']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const gameIdParam = z.object({
  id: z.string().min(1)
});
