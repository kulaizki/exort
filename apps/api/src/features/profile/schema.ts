import { z } from 'zod';

export const updateProfileBody = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional()
});
