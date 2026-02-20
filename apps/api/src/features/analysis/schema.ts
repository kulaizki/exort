import { z } from 'zod';

export const enqueueBody = z.object({
  gameId: z.string().min(1)
});

export const batchEnqueueBody = z.object({
  gameIds: z.array(z.string().min(1)).min(1).max(50)
});

export const jobIdParam = z.object({
  jobId: z.string().min(1)
});
