/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../shared/prisma";
import { IFriendRequestPayload, IFriendUpdatePayload, IFollowPayload, ISaveEventPayload, IReviewPayload } from "./social.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { FriendshipStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";

const sendFriendRequest = async (userId: string, payload: IFriendRequestPayload) => {
  if (userId === payload.receiverId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot send friend request to yourself");
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requestorId: userId, receiverId: payload.receiverId },
        { requestorId: payload.receiverId, receiverId: userId },
      ],
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Friend request already exists or you are already friends");
  }

  const created = await prisma.friendship.create({
    data: {
      requestorId: userId,
      receiverId: payload.receiverId,
      status: FriendshipStatus.REQUESTED,
    },
  });

  await prisma.notification.create({
    data: {
      userId: payload.receiverId,
      title: "New friend request",
      message: `You have a friend request from a user.`,
    },
  });

  return created;
};

const handleFriendAction = async (userId: string, payload: IFriendUpdatePayload) => {
  const friendship = await prisma.friendship.findUniqueOrThrow({
    where: { id: payload.requestId },
  });

  if (friendship.receiverId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Not allowed");
  }

  if (friendship.status !== FriendshipStatus.REQUESTED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Request already handled");
  }

  const updated = await prisma.friendship.update({
    where: { id: friendship.id },
    data: {
      status:
        payload.action === "accept"
          ? FriendshipStatus.ACCEPTED
          : FriendshipStatus.REJECTED,
    },
  });

  await prisma.notification.create({
    data: {
      userId: friendship.requestorId,
      title:
        payload.action === "accept"
          ? "Friend request accepted"
          : "Friend request rejected",
      message:
        payload.action === "accept"
          ? "Your friend request has been accepted."
          : "Your friend request has been rejected.",
    },
  });

  return updated;
};

const listFriendRequests = async (filters: any, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const andConditions: Prisma.FriendshipWhereInput[] = [];

  if (filters.requestorId) andConditions.push({ requestorId: filters.requestorId });
  if (filters.receiverId) andConditions.push({ receiverId: filters.receiverId });
  if (filters.status) andConditions.push({ status: filters.status });

  const where = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.friendship.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      requestor: { select: { id: true, fullName: true, picture: true } },
      receiver: { select: { id: true, fullName: true, picture: true } },
    },
  });

  const total = await prisma.friendship.count({ where });
  return { meta: { page, limit, total }, data };
};

const followUser = async (userId: string, payload: IFollowPayload) => {
  if (userId === payload.followingId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot follow yourself");
  }

  const exists = await prisma.follow.findFirst({
    where: { followerId: userId, followingId: payload.followingId },
  });

  if (exists) {
    await prisma.follow.delete({ where: { id: exists.id } });
    return { action: "unfollowed" };
  }

  const created = await prisma.follow.create({
    data: { followerId: userId, followingId: payload.followingId },
  });

  await prisma.notification.create({
    data: {
      userId: payload.followingId,
      title: "New follower",
      message: `A user started following you.`,
    },
  });

  return created;
};

const listFollows = async (filters: any, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const andConditions: Prisma.FollowWhereInput[] = [];

  if (filters.followerId) andConditions.push({ followerId: filters.followerId });
  if (filters.followingId) andConditions.push({ followingId: filters.followingId });

  const where = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.follow.findMany({
    where,
    skip,
    take: limit,
    include: {
      follower: { select: { id: true, fullName: true, picture: true } },
      following: { select: { id: true, fullName: true, picture: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.follow.count({ where });
  return { meta: { page, limit, total }, data };
};

const toggleSaveEvent = async (userId: string, payload: ISaveEventPayload) => {
  const existing = await prisma.savedEvent.findFirst({
    where: { userId, eventId: payload.eventId },
  });

  if (existing) {
    await prisma.savedEvent.delete({ where: { id: existing.id } });
    return { action: "unsaved" };
  }

  const created = await prisma.savedEvent.create({
    data: { userId, eventId: payload.eventId },
  });

  return created;
};

const listSavedEvents = async (filters: any, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.SavedEventWhereInput[] = [];
  if (filters.userId) andConditions.push({ userId: filters.userId });
  if (filters.eventId) andConditions.push({ eventId: filters.eventId });

  const where = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.savedEvent.findMany({
    where,
    skip,
    take: limit,
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.savedEvent.count({ where });
  return { meta: { page, limit, total }, data };
};


const createReview = async (userId: string, payload: IReviewPayload) => {
  const participant = await prisma.participant.findFirst({
    where: { userId, eventId: payload.eventId },
  });

  if (!participant) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only participants can create reviews");
  }

  const created = await prisma.review.create({
    data: {
      userId,
      eventId: payload.eventId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  const event = await prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const agg = await prisma.review.aggregate({
    where: { eventId: payload.eventId },
    _avg: { rating: true },
    _count: { id: true },
  });

  if (event.hostId) {
    const hostAgg = await prisma.review.aggregate({
      where: { event: { hostId: event.hostId } },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.user.update({
      where: { id: event.hostId },
      data: {
        avgRating: hostAgg._avg.rating ?? 0,
        reviewCount: hostAgg._count.id ?? 0,
      },
    });
  }

  return created;
};

const listReviews = async (filters: any, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (filters.userId) andConditions.push({ userId: filters.userId });
  if (filters.eventId) andConditions.push({ eventId: filters.eventId });

  const where = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    include: { user: { select: { id: true, fullName: true, picture: true } }, event: true },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.review.count({ where });
  return { meta: { page, limit, total }, data };
};

const listNotifications = async (filters: any, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const andConditions: Prisma.NotificationWhereInput[] = [];

  if (filters.userId) andConditions.push({ userId: filters.userId });
  if (typeof filters.isRead !== "undefined") andConditions.push({ isRead: filters.isRead === "true" || filters.isRead === true });

  const where = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.notification.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.notification.count({ where });
  return { meta: { page, limit, total }, data };
};

const markNotificationRead = async (notificationId: string, userId: string) => {
  const n = await prisma.notification.findUniqueOrThrow({ where: { id: notificationId } });
  if (n.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
};

export const SocialService = {
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