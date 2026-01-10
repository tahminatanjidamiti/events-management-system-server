"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createEventValidationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    eventType: zod_1.z.string().optional().nullable(),
    hostId: zod_1.z.string(),
    description: zod_1.z.string().min(1),
    minParticipants: zod_1.z.number().int().optional().nullable(),
    maxParticipants: zod_1.z.number().int().optional().nullable(),
    image: zod_1.z.string().optional().nullable(),
    location: zod_1.z.object({
        lat: zod_1.z.number({ message: "Latitude" }),
        lng: zod_1.z.number({ message: "Longitude" }),
        formattedAddress: zod_1.z.string().optional(),
    }).optional().nullable(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    status: zod_1.z.enum([
        client_1.EventStatus.OPEN,
        client_1.EventStatus.FULL,
        client_1.EventStatus.COMPLETED,
        client_1.EventStatus.CANCELLED,
    ]).optional(),
    joiningFee: zod_1.z.number().nonnegative().optional(),
});
const updateEventValidationSchema = createEventValidationSchema.partial();
exports.EventValidation = {
    createEventValidationSchema,
    updateEventValidationSchema
};
