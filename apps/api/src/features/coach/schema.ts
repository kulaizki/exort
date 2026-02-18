import { z } from 'zod';

export const createSessionBody = z.object({
  title: z.string().optional(),
  gameId: z.string().optional()
});

export const sessionIdParam = z.object({
  id: z.string().min(1)
});

export const sendMessageBody = z.object({
  content: z.string().min(1).max(5000)
});
