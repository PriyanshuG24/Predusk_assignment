import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.string().default('development'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  process.exit(1);
}

export const env = parsed.data;
