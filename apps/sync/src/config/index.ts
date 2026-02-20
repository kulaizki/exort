import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3002),
  API_BASE_URL: z.string().default('http://localhost:3001'),
  SYNC_SECRET: z.string().min(1)
});

export const config = envSchema.parse(process.env);
