import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

export const roleSchema = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);
export const userStatusSchema = z.enum(['ACTIVE', 'DISABLED']);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  status: z.string().trim().optional(),
});

export const invitationListQuerySchema = paginationQuerySchema.extend({
  package: z.preprocess(emptyToUndefined, z.enum(['BASIC', 'STANDARD', 'PREMIUM']).optional()),
  paymentStatus: z.preprocess(emptyToUndefined, z.enum(['PENDING', 'PAID', 'FAILED']).optional()),
});

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z.preprocess(emptyToUndefined, z.enum(['PENDING', 'PAID', 'FAILED']).optional()),
});

export const rsvpListQuerySchema = paginationQuerySchema.extend({
  invitationId: z.string().trim().optional(),
  attending: z.preprocess((value) => {
    if (value === undefined || value === '') return undefined;
    return value === 'true' || value === true;
  }, z.boolean().optional()),
});

export const createUserSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1).optional(),
  role: roleSchema.default('VIEWER'),
  status: userStatusSchema.default('ACTIVE'),
});

export const updateUserSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().trim().min(1).optional(),
  role: roleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const updateRsvpSchema = z.object({
  guestName: z.string().trim().min(1).optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  phone: z.string().trim().optional(),
  attending: z.boolean().optional(),
  guestCount: z.number().int().min(1).optional(),
  message: z.string().trim().optional(),
});

export const orderCreateSchema = z.object({
  invitationId: z.string().trim().min(1),
  customerEmail: z.string().email().transform((value) => value.toLowerCase()),
  customerName: z.string().trim().optional(),
  package: z.preprocess((value) => (
    typeof value === 'string' ? value.toUpperCase() : value
  ), z.enum(['BASIC', 'STANDARD', 'PREMIUM'])),
  amount: z.coerce.number().min(0),
  currency: z.string().trim().length(3).default('INR'),
  paymentMethod: z.string().trim().optional(),
  transactionId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const orderUpdateSchema = orderCreateSchema.partial().extend({
  status: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
});

export const verifyPaymentSchema = z.object({
  transactionId: z.string().trim().min(4, 'Transaction ID is required'),
});

export const siteConfigSchema = z.object({
  siteName: z.string().trim().min(1).optional(),
  supportEmail: z.union([z.string().email(), z.literal('')]).optional(),
  supportPhone: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  announcement: z.string().trim().optional(),
  maintenanceMode: z.boolean().optional(),
  brand: z.record(z.any()).optional(),
  payment: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  socialLinks: z.record(z.any()).optional(),
}).strict();
