"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewSchema = exports.SaveEventSchema = exports.FollowSchema = exports.FriendActionSchema = exports.SendFriendRequestSchema = void 0;
const zod_1 = require("zod");
exports.SendFriendRequestSchema = zod_1.z.object({
    receiverId: zod_1.z.string(),
});
exports.FriendActionSchema = zod_1.z.object({
    requestId: zod_1.z.string(),
    action: zod_1.z.enum(["accept", "reject"]),
});
exports.FollowSchema = zod_1.z.object({
    followingId: zod_1.z.string(),
});
exports.SaveEventSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
});
exports.CreateReviewSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    rating: zod_1.z.number().min(0).max(5),
    comment: zod_1.z.string().optional(),
});
