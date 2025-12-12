/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { SocialService } from "./social.service";
import { IUser } from "../user/user.interface";
import pick from "../../helper/pick";
import { friendFilterableFields, followFilterableFields, savedEventFilterableFields, reviewFilterableFields, notificationFilterableFields } from "./social.constant";

const sendFriendRequest = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.sendFriendRequest(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Friend request sent", data: result });
});

const handleFriendAction = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.handleFriendAction(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Friend request updated", data: result });
});

const listFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, friendFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SocialService.listFriendRequests(filters, options);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Friend requests", meta: result.meta, data: result.data });
});

const followUser = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.followUser(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Follow toggled", data: result });
});

const listFollows = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, followFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SocialService.listFollows(filters, options);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Follows", meta: result.meta, data: result.data });
});

const toggleSaveEvent = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.toggleSaveEvent(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Saved event toggled", data: result });
});

const listSavedEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, savedEventFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SocialService.listSavedEvents(filters, options);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Saved events", meta: result.meta, data: result.data });
});

const createReview = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.createReview(req.user!.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Review created", data: result });
});

const listReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SocialService.listReviews(filters, options);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Reviews", meta: result.meta, data: result.data });
});

const listNotifications = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const filters = pick(req.query, notificationFilterableFields);
  // ensure only user's notifications when not admin
  if (!filters.userId && req.user) filters.userId = req.user.id;
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await SocialService.listNotifications(filters, options);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notifications", meta: result.meta, data: result.data });
});

const markNotificationRead = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const result = await SocialService.markNotificationRead(req.params.id, req.user!.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notification marked read", data: result });
});

export const SocialController = {
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