import express from "express";
import { SocialController } from "./social.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { SendFriendRequestSchema, FriendActionSchema, FollowSchema, CreateReviewSchema } from "./social.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post("/friend", auth(Role.USER), validateRequest(SendFriendRequestSchema), SocialController.sendFriendRequest);

router.patch("/friend", auth(Role.USER), validateRequest(FriendActionSchema), SocialController.handleFriendAction);

router.get("/friend", auth(Role.USER), SocialController.listFriendRequests);

router.post("/follow", auth(Role.USER), validateRequest(FollowSchema), SocialController.followUser);

router.get("/follow", auth(Role.USER), SocialController.listFollows);

router.get("/save", auth(Role.USER), SocialController.listSavedEvents);

router.post("/review", validateRequest (CreateReviewSchema), auth(Role.USER), SocialController.createReview);
router.get("/review", SocialController.listReviews);

router.get("/notifications", auth(Role.USER), SocialController.listNotifications);
router.patch("/notifications/:id/read", auth(Role.USER), SocialController.markNotificationRead);

export const SocialRoutes = router;