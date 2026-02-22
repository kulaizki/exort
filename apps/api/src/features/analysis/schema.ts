import { z } from 'zod';

export const enqueueBody = z.object({
  gameId: z.string().min(1)
});

export const jobIdParam = z.object({
  jobId: z.string().min(1)
});
