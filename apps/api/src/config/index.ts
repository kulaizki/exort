import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BETTER_AUTH_SECRET: z.string().min(1),
  SYNC_SERVICE_URL: z.string().default('http://localhost:3002'),
  SYNC_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1)
});

export const config = envSchema.parse(process.env);
