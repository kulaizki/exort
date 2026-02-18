import { z } from 'zod';

export const trendsQuery = z.object({
  period: z.enum(['week', 'month']).default('week'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});
