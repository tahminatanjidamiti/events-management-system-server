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
exports.MetaService = void 0;
const prisma_1 = require("../../shared/prisma");
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fetchDashboardMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    switch (user.role) {
        case client_1.Role.ADMIN:
            return getAdminMetaData();
        case client_1.Role.HOST:
            return getHostMetaData(user);
        case client_1.Role.USER:
            return getUserMetaData(user);
        default:
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid user role");
    }
});
const getHostMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const host = yield prisma_1.prisma.host.findUnique({ where: { userId: user.id } });
    if (!host)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Host profile not found");
    const hostedEvents = yield prisma_1.prisma.event.findMany({
        where: { hostId: user.id },
    });
    const upcomingCount = yield prisma_1.prisma.event.count({
        where: { hostId: user.id, startDate: { gt: new Date() } },
    });
    const pastCount = yield prisma_1.prisma.event.count({
        where: { hostId: user.id, endDate: { lt: new Date() } },
    });
    const participantCount = yield prisma_1.prisma.participant.count({
        where: { event: { hostId: user.id } },
    });
    const totalRevenue = yield prisma_1.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { event: { hostId: user.id }, status: client_1.PaymentStatus.PAID },
    });
    const statusGroup = yield prisma_1.prisma.event.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { hostId: user.id },
    });
    const formattedStatus = statusGroup.map(({ status, _count }) => ({ status, count: Number(_count.id) }));
    return {
        hostedEventsCount: hostedEvents.length,
        upcomingCount,
        pastCount,
        participantCount,
        totalRevenue: (_a = totalRevenue._sum.amount) !== null && _a !== void 0 ? _a : 0,
        eventStatusDistribution: formattedStatus,
    };
});
const getUserMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.id;
    const upcoming = yield prisma_1.prisma.participant.count({
        where: { userId, event: { startDate: { gt: new Date() } } },
    });
    const past = yield prisma_1.prisma.participant.count({
        where: { userId, event: { endDate: { lt: new Date() } } },
    });
    const saved = yield prisma_1.prisma.savedEvent.count({ where: { userId } });
    const paymentCount = yield prisma_1.prisma.payment.count({ where: { userId, status: client_1.PaymentStatus.PAID } });
    return {
        upcomingCount: upcoming,
        pastCount: past,
        savedCount: saved,
        paidPaymentsCount: paymentCount,
    };
});
const getAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userCount = yield prisma_1.prisma.user.count();
    const hostCount = yield prisma_1.prisma.host.count();
    const eventCount = yield prisma_1.prisma.event.count();
    const participantCount = yield prisma_1.prisma.participant.count();
    const paymentCount = yield prisma_1.prisma.payment.count();
    const totalRevenue = yield prisma_1.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: client_1.PaymentStatus.PAID } });
    const eventsPerMonth = yield prisma_1.prisma.$queryRaw `
    SELECT DATE_TRUNC('month', "createdAt") AS month, CAST(COUNT(*) AS INTEGER) AS count
    FROM "Event"
    GROUP BY month
    ORDER BY month ASC
  `;
    const statusDistribution = yield prisma_1.prisma.event.groupBy({ by: ["status"], _count: { id: true } });
    const formattedStatus = statusDistribution.map(({ status, _count }) => ({ status, count: Number(_count.id) }));
    return {
        userCount,
        hostCount,
        eventCount,
        participantCount,
        paymentCount,
        totalRevenue: (_a = totalRevenue._sum.amount) !== null && _a !== void 0 ? _a : 0,
        eventsPerMonth,
        eventStatusDistribution: formattedStatus,
    };
});
exports.MetaService = {
    fetchDashboardMetaData,
};
