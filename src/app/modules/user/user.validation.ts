import { z } from "zod";

const createUserValidationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  city: z.object({
        lat: z.number({ message: "Latitude is required" }),
        lng: z.number({ message: "Longitude is required" }),
        formattedAddress: z.string().optional(),
    }).optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
});
const updateUserValidationSchema = z.object({
  fullName: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  city: z.object({
        lat: z.number({ message: "Latitude" }),
        lng: z.number({ message: "Longitude" }),
        formattedAddress: z.string().optional(),
    }).optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  status: z.string().optional(),
});
export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema
};
