import { EventStatus } from "@prisma/client";
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
    lat: z.number({ message: "Latitude" }),
    lng: z.number({ message: "Longitude" }),
    formattedAddress: z.string().optional(),
  }).optional().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum([
    EventStatus.OPEN,
    EventStatus.FULL,
    EventStatus.COMPLETED,
    EventStatus.CANCELLED,
  ]).optional(),
  joiningFee: z.number().nonnegative().optional(),
});

const updateEventValidationSchema = createEventValidationSchema.partial();

export const EventValidation = {
  createEventValidationSchema,
  updateEventValidationSchema
};