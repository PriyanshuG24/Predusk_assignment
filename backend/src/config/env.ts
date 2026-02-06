import "dotenv/config";
import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";

const EnvSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.string().default("development"),
  MONGODB_URI: isTest ? z.string().optional() : z.string(),
  BASIC_AUTH_EMAIL: isTest ? z.string().optional() : z.string(),
  BASIC_AUTH_PASS: isTest ? z.string().optional() : z.string(),
  BASIC_AUTH_USER: isTest ? z.string().optional() : z.string(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
