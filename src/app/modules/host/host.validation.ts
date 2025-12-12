import { z } from "zod";
import { HostUpdateStatus } from "@prisma/client";

const createHostSchema = z.object({
  userId: z.string(),
  message: z.string().optional(),
});

const approvedHostSchema = z.object({
  status: z.enum([
    HostUpdateStatus.PENDING,
    HostUpdateStatus.APPROVED,
  ]),
});
const updateHostSchema = createHostSchema.partial();
export const HostValidation = {
  createHostSchema,
  updateHostSchema,
  approvedHostSchema,
};