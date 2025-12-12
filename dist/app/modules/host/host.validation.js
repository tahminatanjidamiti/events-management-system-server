"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createHostSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    message: zod_1.z.string().optional(),
});
const approvedHostSchema = zod_1.z.object({
    status: zod_1.z.enum([
        client_1.HostUpdateStatus.PENDING,
        client_1.HostUpdateStatus.APPROVED,
    ]),
});
const updateHostSchema = createHostSchema.partial();
exports.HostValidation = {
    createHostSchema,
    updateHostSchema,
    approvedHostSchema,
};
