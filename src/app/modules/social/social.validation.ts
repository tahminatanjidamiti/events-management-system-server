import { z } from "zod";

export const SendFriendRequestSchema = z.object({
  receiverId: z.string(),
});

export const FriendActionSchema = z.object({
  requestId: z.string(),
  action: z.enum(["accept", "reject"]),
});

export const FollowSchema = z.object({
  followingId: z.string(),
});

export const SaveEventSchema = z.object({
  eventId: z.string(),
});

export const CreateReviewSchema = z.object({
  eventId: z.string(),
  rating: z.number().min(0).max(5),
  comment: z.string().optional(),
});
