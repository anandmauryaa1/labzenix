import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string()
    .min(32, "JWT_SECRET must be at least 32 characters for production")
    .refine(v => v !== 'your_super_secret_jwt_key_change_me' && v !== 'your_very_secure_random_jwt_secret_here', 
      "JWT_SECRET must be changed from default value"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL").optional().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    logger.error('CRITICAL: Invalid environment variables', errors);
    
    // List missing/invalid fields for debugging
    const invalidFields = Object.keys(errors).join(', ');
    throw new Error(`Invalid environment variables: ${invalidFields}. Check your .env file and .env.example.`);
  }

  // Warn if using placeholder values
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLOUDINARY_API_SECRET) {
      logger.warn('WARNING: CLOUDINARY_API_SECRET not set - image uploads may not work');
    }
  }

  return result.data;
};

export const env = (process.env as unknown) as z.infer<typeof envSchema>;
