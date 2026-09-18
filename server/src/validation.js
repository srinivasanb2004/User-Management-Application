import { z } from 'zod';

export const userSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 ()-]{6,19}$/, 'Enter a valid phone number'),
  role: z.enum(['user', 'admin'])
}).strict();

export const listSchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).strict();
