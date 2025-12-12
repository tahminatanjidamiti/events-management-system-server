import express from "express";
import { HostController } from "./host.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { HostValidation } from "./host.validation";

const router = express.Router();
router.get("/", HostController.getAllHosts);
router.post(
  "/request",
  auth(Role.USER),
  (req, res, next) => {
    req.body = HostValidation.createHostSchema.parse(req.body);
    next();
  },
  HostController.requestHost
);

router.patch(
  "/:id",
  auth(Role.HOST),
  (req, res, next) => {
    req.body = HostValidation.updateHostSchema.parse(req.body);
    next();
  },
  HostController.updateHost
);
router.patch(
  "/approve/:id",
  auth(Role.ADMIN),
  (req, res, next) => {
    req.body = HostValidation.approvedHostSchema.parse(req.body);
    next();
  },
  HostController.approveHost
);




export const HostRoutes = router;