import express from "express";
import { MetaController } from "./meta.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", auth(Role.ADMIN, Role.HOST, Role.USER), MetaController.fetchDashboardMetaData);

export const MetaRoutes = router;