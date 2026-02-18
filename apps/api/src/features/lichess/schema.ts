import { z } from 'zod';

export const connectBody = z.object({
  lichessUsername: z.string().min(1).max(50)
});
