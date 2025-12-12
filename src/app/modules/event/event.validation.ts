import { z } from "zod";

const createEventValidationSchema = z.object({
  title: z.string().min(1),
  eventType: z.string().optional().nullable(),
  hostId: z.string(),
  description: z.string().min(1),
  minParticipants: z.number().int().optional().nullable(),
  maxParticipants: z.number().int().optional().nullable(),
  image: z.string().optional().nullable(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    formattedAddress: z.string().optional(),
  }).optional().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  joiningFee: z.number().nonnegative().optional(),
});

const updateEventValidationSchema = createEventValidationSchema.partial();

export const EventValidation = {
  createEventValidationSchema,
  updateEventValidationSchema
};