import express from "express";
import { EventController } from "./event.controller";
import { fileUploader } from "../../helper/fileUploader";
import { EventValidation } from "./event.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";


const router = express.Router();

router.get("/me", auth(Role.ADMIN, Role.HOST, Role.USER), EventController.myEvents);
router.get("/", EventController.listEvents);
router.get("/:id", EventController.getEvent);
router.post("/suggestion", EventController.getAISuggestions);
router.post("/", auth(Role.HOST), fileUploader.upload.single("file"), validateRequest(EventValidation.createEventValidationSchema), EventController.createEvent)
router.patch("/:id", auth(Role.HOST), fileUploader.upload.single("file"),
  validateRequest(EventValidation.updateEventValidationSchema), EventController.updateEvent);
router.delete("/:id", auth(Role.ADMIN, Role.HOST), EventController.deleteEvent);

export const EventRoutes = router;