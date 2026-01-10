import express from "express";
import { HostController } from "./host.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { HostValidation } from "./host.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();
router.get("/", auth(Role.ADMIN), HostController.getAllHosts);
router.post("/request", validateRequest(HostValidation.createHostSchema), auth(Role.USER), HostController.requestHost);

router.patch(
  "/approve/:id",
  validateRequest(HostValidation.approvedHostSchema),
  auth(Role.ADMIN), HostController.approveHost);
router.patch("/:id",  validateRequest(HostValidation.updateHostSchema), auth(Role.HOST), HostController.updateHost
);

export const HostRoutes = router;