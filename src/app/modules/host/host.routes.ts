import express from "express";
import { HostController } from "./host.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { HostValidation } from "./host.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();
router.get("/", auth(Role.ADMIN, Role.HOST), HostController.getAllHosts);
router.get("/:id", auth(Role.HOST), HostController.getHostById);
router.post("/request", auth(Role.USER), validateRequest(HostValidation.createHostSchema), HostController.requestHost);

router.patch("/approve/:id", auth(Role.ADMIN), validateRequest(HostValidation.approvedHostSchema), HostController.approveHost);
router.patch("/:id", auth(Role.HOST), validateRequest(HostValidation.updateHostSchema), HostController.updateHost
);

export const HostRoutes = router;