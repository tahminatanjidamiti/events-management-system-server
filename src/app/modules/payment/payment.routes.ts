// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // important for signature verification
//   stripeWebhookHandler
// );

import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/create-session",
  auth(Role.USER),
  PaymentController.createCheckoutSession
);

export const PaymentRoutes = router;