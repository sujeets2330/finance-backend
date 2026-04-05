import { z } from 'zod';

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional().default('VIEWER'),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Financial Record Validators
export const CreateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required').max(50),
  description: z.string().optional(),
  date: z.string().datetime('Invalid date format'),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional().default('COMPLETED'),
  userId: z.string().optional(),
  assignToRole: z.enum(['ANALYST', 'VIEWER']).optional(),
});

export const UpdateRecordSchema = CreateRecordSchema.partial();

export const RecordFilterSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(100),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword'],
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).default('VIEWER'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;
export type RecordFilterInput = z.infer<typeof RecordFilterSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;