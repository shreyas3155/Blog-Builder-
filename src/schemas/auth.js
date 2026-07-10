import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'READER']).default('READER').optional(),
});
