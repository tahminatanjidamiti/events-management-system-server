"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostService = void 0;
const prisma_1 = require("../../shared/prisma");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestToBecomeHost = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.prisma.host.findUnique({
        where: { id },
    });
    if (existing) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Host request already exists");
    }
    return prisma_1.prisma.host.create({
        data: {
            userId: id,
            message: payload.message,
        },
    });
});
const updateHost = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate = Object.assign({}, req.body);
    const updatedHost = yield prisma_1.prisma.host.update({
        where: { id },
        data: dataToUpdate,
    });
    return updatedHost;
});
const approveHost = (hostId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const host = yield tx.host.update({
            where: { id: hostId },
            data: {
                status: client_1.HostUpdateStatus.APPROVED,
                reviewedAt: new Date(),
            },
            include: { user: true },
        });
        yield tx.user.update({
            where: { id: host.userId },
            data: { role: client_1.Role.HOST },
        });
        return host;
    }));
});
const getAllHosts = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.host.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    picture: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
});
exports.HostService = {
    requestToBecomeHost,
    updateHost,
    approveHost,
    getAllHosts,
};
