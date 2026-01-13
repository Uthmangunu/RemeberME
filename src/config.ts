import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
});

export const config = envSchema.parse(process.env);
