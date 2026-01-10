import express from "express";
import { SocialController } from "./social.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { SendFriendRequestSchema, FriendActionSchema, FollowSchema, SaveEventSchema, CreateReviewSchema } from "./social.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post("/friend", validateRequest(SendFriendRequestSchema), auth(Role.USER), SocialController.sendFriendRequest);

router.patch("/friend", validateRequest(FriendActionSchema), auth(Role.USER), SocialController.handleFriendAction);

router.get("/friend", auth(Role.USER), SocialController.listFriendRequests);

router.post("/follow", validateRequest(FollowSchema), auth(Role.USER), SocialController.followUser);

router.get("/follow", auth(Role.USER), SocialController.listFollows);

router.post("/save", validateRequest (SaveEventSchema), auth(Role.USER), SocialController.toggleSaveEvent);

router.get("/save", auth(Role.USER), SocialController.listSavedEvents);

router.post("/review", validateRequest (CreateReviewSchema), auth(Role.USER), SocialController.createReview);
router.get("/review", SocialController.listReviews);

router.get("/notifications", auth(Role.USER), SocialController.listNotifications);
router.patch("/notifications/:id/read", auth(Role.USER), SocialController.markNotificationRead);

export const SocialRoutes = router;