import { z } from 'zod';

const idSchema = z.union([z.string(), z.number()]).optional().transform((value) => (
  value === undefined || value === null ? undefined : String(value)
));

export const invitationSchema = z.object({
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.union([z.string(), z.date(), z.null()]).optional(),
  package: z.enum(['BASIC', 'STANDARD', 'PREMIUM']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  
  // JSON Blobs
  couple: z.any().optional(),
  event: z.any().optional(),
  family: z.any().optional(),
  content: z.any().optional(),
  media: z.any().optional(),
  theme: z.any().optional(),
  positions: z.any().optional(),
  
  // Relations (mostly handled in services but can be passed)
  events: z.array(z.object({
    id: idSchema,
    name: z.string(),
    date: z.string().optional(),
    time: z.string().optional(),
    venue: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  
  widgets: z.array(z.object({
    id: idSchema,
    type: z.string(),
    x: z.number(),
    y: z.number(),
    w: z.number().optional(),
    h: z.number().optional(),
    config: z.any().optional(),
  })).optional(),
});

export const rsvpSchema = z.object({
  guestName: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  attending: z.boolean(),
  guestCount: z.number().int().min(1).default(1),
  message: z.string().optional(),
});
