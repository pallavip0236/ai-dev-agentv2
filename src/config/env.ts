import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000"),
  VITE_ENV: z.enum(["production", "development", "local"]).default("local")
});

const parseResult = envSchema.safeParse(import.meta.env);

if (!parseResult.success) {
  console.error(
    "❌ Invalid environment variables:",
    parseResult.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

const env = parseResult.data;

export const API_URL = env.VITE_API_URL;
export const ENV = env.VITE_ENV;
