import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL").optional().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error('CRITICAL: Invalid environment variables', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check your .env file.');
  }

  return result.data;
};

export const env = (process.env as unknown) as z.infer<typeof envSchema>;
