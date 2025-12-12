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
exports.SocialService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const prisma_1 = require("../../shared/prisma");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../helper/paginationHelper");
const sendFriendRequest = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === payload.receiverId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot send friend request to yourself");
    }
    const existing = yield prisma_1.prisma.friendship.findFirst({
        where: {
            OR: [
                { requestorId: userId, receiverId: payload.receiverId },
                { requestorId: payload.receiverId, receiverId: userId },
            ],
        },
    });
    if (existing) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "Friend request already exists or you are already friends");
    }
    const created = yield prisma_1.prisma.friendship.create({
        data: {
            requestorId: userId,
            receiverId: payload.receiverId,
            status: client_1.FriendshipStatus.REQUESTED,
        },
    });
    yield prisma_1.prisma.notification.create({
        data: {
            userId: payload.receiverId,
            title: "New friend request",
            message: `You have a friend request from a user.`,
        },
    });
    return created;
});
const handleFriendAction = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield prisma_1.prisma.friendship.findUniqueOrThrow({ where: { id: payload.requestId } });
    if (req.receiverId !== userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Not allowed");
    }
    if (payload.action === "accept") {
        const updated = yield prisma_1.prisma.friendship.update({
            where: { id: payload.requestId },
            data: { status: client_1.FriendshipStatus.ACCEPTED },
        });
        // notify requestor
        yield prisma_1.prisma.notification.create({
            data: {
                userId: req.requestorId,
                title: "Friend request accepted",
                message: `Your friend request has been accepted.`,
            },
        });
        return updated;
    }
    else {
        const updated = yield prisma_1.prisma.friendship.update({
            where: { id: payload.requestId },
            data: { status: client_1.FriendshipStatus.REJECTED },
        });
        yield prisma_1.prisma.notification.create({
            data: {
                userId: req.requestorId,
                title: "Friend request rejected",
                message: `Your friend request has been rejected.`,
            },
        });
        return updated;
    }
});
const listFriendRequests = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filters.requestorId)
        andConditions.push({ requestorId: filters.requestorId });
    if (filters.receiverId)
        andConditions.push({ receiverId: filters.receiverId });
    if (filters.status)
        andConditions.push({ status: filters.status });
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.friendship.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            requestor: { select: { id: true, fullName: true, picture: true } },
            receiver: { select: { id: true, fullName: true, picture: true } },
        },
    });
    const total = yield prisma_1.prisma.friendship.count({ where });
    return { meta: { page, limit, total }, data };
});
const followUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === payload.followingId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot follow yourself");
    }
    const exists = yield prisma_1.prisma.follow.findFirst({
        where: { followerId: userId, followingId: payload.followingId },
    });
    if (exists) {
        yield prisma_1.prisma.follow.delete({ where: { id: exists.id } });
        return { action: "unfollowed" };
    }
    const created = yield prisma_1.prisma.follow.create({
        data: { followerId: userId, followingId: payload.followingId },
    });
    yield prisma_1.prisma.notification.create({
        data: {
            userId: payload.followingId,
            title: "New follower",
            message: `A user started following you.`,
        },
    });
    return created;
});
const listFollows = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filters.followerId)
        andConditions.push({ followerId: filters.followerId });
    if (filters.followingId)
        andConditions.push({ followingId: filters.followingId });
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.follow.findMany({
        where,
        skip,
        take: limit,
        include: {
            follower: { select: { id: true, fullName: true, picture: true } },
            following: { select: { id: true, fullName: true, picture: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    const total = yield prisma_1.prisma.follow.count({ where });
    return { meta: { page, limit, total }, data };
});
const toggleSaveEvent = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.prisma.savedEvent.findFirst({
        where: { userId, eventId: payload.eventId },
    });
    if (existing) {
        yield prisma_1.prisma.savedEvent.delete({ where: { id: existing.id } });
        return { action: "unsaved" };
    }
    const created = yield prisma_1.prisma.savedEvent.create({
        data: { userId, eventId: payload.eventId },
    });
    return created;
});
const listSavedEvents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filters.userId)
        andConditions.push({ userId: filters.userId });
    if (filters.eventId)
        andConditions.push({ eventId: filters.eventId });
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.savedEvent.findMany({
        where,
        skip,
        take: limit,
        include: { event: true },
        orderBy: { createdAt: "desc" },
    });
    const total = yield prisma_1.prisma.savedEvent.count({ where });
    return { meta: { page, limit, total }, data };
});
const createReview = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const participant = yield prisma_1.prisma.participant.findFirst({
        where: { userId, eventId: payload.eventId },
    });
    if (!participant) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only participants can create reviews");
    }
    const created = yield prisma_1.prisma.review.create({
        data: {
            userId,
            eventId: payload.eventId,
            rating: payload.rating,
            comment: payload.comment,
        },
    });
    const event = yield prisma_1.prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const agg = yield prisma_1.prisma.review.aggregate({
        where: { eventId: payload.eventId },
        _avg: { rating: true },
        _count: { id: true },
    });
    if (event.hostId) {
        const hostAgg = yield prisma_1.prisma.review.aggregate({
            where: { event: { hostId: event.hostId } },
            _avg: { rating: true },
            _count: { id: true },
        });
        yield prisma_1.prisma.user.update({
            where: { id: event.hostId },
            data: {
                avgRating: (_a = hostAgg._avg.rating) !== null && _a !== void 0 ? _a : 0,
                reviewCount: (_b = hostAgg._count.id) !== null && _b !== void 0 ? _b : 0,
            },
        });
    }
    return created;
});
const listReviews = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filters.userId)
        andConditions.push({ userId: filters.userId });
    if (filters.eventId)
        andConditions.push({ eventId: filters.eventId });
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, fullName: true, picture: true } }, event: true },
        orderBy: { createdAt: "desc" },
    });
    const total = yield prisma_1.prisma.review.count({ where });
    return { meta: { page, limit, total }, data };
});
const listNotifications = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (filters.userId)
        andConditions.push({ userId: filters.userId });
    if (typeof filters.isRead !== "undefined")
        andConditions.push({ isRead: filters.isRead === "true" || filters.isRead === true });
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    });
    const total = yield prisma_1.prisma.notification.count({ where });
    return { meta: { page, limit, total }, data };
});
const markNotificationRead = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const n = yield prisma_1.prisma.notification.findUniqueOrThrow({ where: { id: notificationId } });
    if (n.userId !== userId)
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Not allowed");
    return prisma_1.prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
});
exports.SocialService = {
    sendFriendRequest,
    handleFriendAction,
    listFriendRequests,
    followUser,
    listFollows,
    toggleSaveEvent,
    listSavedEvents,
    createReview,
    listReviews,
    listNotifications,
    markNotificationRead,
};
