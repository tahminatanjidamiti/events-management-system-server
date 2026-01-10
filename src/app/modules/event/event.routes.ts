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
router.post("/", fileUploader.upload.single("file"), validateRequest(EventValidation.createEventValidationSchema), auth(Role.HOST), EventController.createEvent)
router.patch("/:id", fileUploader.upload.single("file"),
  validateRequest(EventValidation.updateEventValidationSchema), auth(Role.HOST), EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);

export const EventRoutes = router;