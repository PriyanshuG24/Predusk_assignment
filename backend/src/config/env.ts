import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string(),
  NODE_ENV: z.string().default('development'),
  BASIC_AUTH_USER: z.string(),
  BASIC_AUTH_PASS: z.string(),
  BASIC_AUTH_EMAIL: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  process.exit(1);
}

export const env = parsed.data;
