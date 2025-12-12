"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required"),
    email: zod_1.z.email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().optional(),
    city: zod_1.z.object({
        lat: zod_1.z.number({ message: "Latitude is required" }),
        lng: zod_1.z.number({ message: "Longitude is required" }),
        formattedAddress: zod_1.z.string().optional(),
    }).optional(),
    bio: zod_1.z.string().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateUserValidationSchema = zod_1.z.object({
    fullName: zod_1.z.string().optional(),
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().optional(),
    city: zod_1.z.object({
        lat: zod_1.z.number({ message: "Latitude" }),
        lng: zod_1.z.number({ message: "Longitude" }),
        formattedAddress: zod_1.z.string().optional(),
    }).optional(),
    bio: zod_1.z.string().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.string().optional(),
});
exports.UserValidation = {
    createUserValidationSchema,
    updateUserValidationSchema
};
