import express from "express";
import { SocialController } from "./social.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { SendFriendRequestSchema, FriendActionSchema, FollowSchema, SaveEventSchema, CreateReviewSchema } from "./social.validation";

const router = express.Router();

router.post("/friend", auth(Role.USER), (req, res, next) => {
  req.body = SendFriendRequestSchema.parse(req.body);
  next();
}, SocialController.sendFriendRequest);

router.patch("/friend", auth(Role.USER), (req, res, next) => {
  req.body = FriendActionSchema.parse(req.body);
  next();
}, SocialController.handleFriendAction);

router.get("/friend", auth(Role.USER), SocialController.listFriendRequests);

router.post("/follow", auth(Role.USER), (req, res, next) => {
  req.body = FollowSchema.parse(req.body);
  next();
}, SocialController.followUser);

router.get("/follow", auth(Role.USER), SocialController.listFollows);

router.post("/save", auth(Role.USER), (req, res, next) => {
  req.body = SaveEventSchema.parse(req.body);
  next();
}, SocialController.toggleSaveEvent);

router.get("/save", auth(Role.USER), SocialController.listSavedEvents);

router.post("/review", auth(Role.USER), (req, res, next) => {
  req.body = CreateReviewSchema.parse(req.body);
  next();
}, SocialController.createReview);
router.get("/review", SocialController.listReviews);

router.get("/notifications", auth(Role.USER), SocialController.listNotifications);
router.patch("/notifications/:id/read", auth(Role.USER), SocialController.markNotificationRead);

export const SocialRoutes = router;