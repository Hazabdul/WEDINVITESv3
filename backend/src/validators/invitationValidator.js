import { z } from 'zod';

const idSchema = z.union([z.string(), z.number()]).optional().transform((value) => (
  value === undefined || value === null ? undefined : String(value)
));

const packageSchema = z.preprocess((value) => (
  typeof value === 'string' ? value.toUpperCase() : value
), z.enum(['BASIC', 'STANDARD', 'PREMIUM']));

const nullableEmailSchema = z.union([z.string().email(), z.literal(''), z.null()]).optional()
  .transform((value) => (value ? String(value).toLowerCase() : undefined));

export const invitationSchema = z.object({
  email: nullableEmailSchema,
  customerEmail: nullableEmailSchema,
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.union([z.string(), z.date(), z.null()]).optional(),
  package: packageSchema.optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishPolicy: z.enum(['strict', 'flexible']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
  
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

const hasRequiredValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

export const getInvitationPublishMissingFields = (invitation = {}) => {
  const couple = invitation.couple || {};
  const event = invitation.event || {};
  const family = invitation.family || {};
  const media = invitation.media || {};

  const coreFields = [
    { path: 'email', label: 'Email address', value: invitation.email || event.email },
    { path: 'couple.bride', label: 'Bride name', value: couple.bride || invitation.brideName },
    { path: 'couple.groom', label: 'Groom name', value: couple.groom || invitation.groomName },
  ];

  const strictFields = [
    { path: 'family.brideParents', label: "Bride's parents", value: family.brideParents },
    { path: 'family.groomParents', label: "Groom's parents", value: family.groomParents },
    { path: 'event.date', label: 'Date', value: event.date || invitation.weddingDate },
    { path: 'event.venue', label: 'Venue', value: event.venue },
    { path: 'event.address', label: 'Venue address', value: event.address },
    { path: 'event.mapLink', label: 'Map link', value: event.mapLink },
    { path: 'media.coverImage', label: 'Banner photo', value: media.coverImage || media.coupleImage },
    { path: 'media.brideImage', label: 'Bride photo', value: media.brideImage },
    { path: 'media.groomImage', label: 'Groom photo', value: media.groomImage },
  ];

  const requiredFields = invitation.publishPolicy === 'flexible'
    ? coreFields
    : [...coreFields, ...strictFields];

  return requiredFields
    .filter((field) => !hasRequiredValue(field.value))
    .map(({ path, label }) => ({ path, label }));
};

export const rsvpSchema = z.object({
  guestName: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  attending: z.boolean(),
  guestCount: z.number().int().min(1).default(1),
  message: z.string().optional(),
});
