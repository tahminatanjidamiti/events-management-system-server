import express, { NextFunction, Request, Response } from "express";
import { EventController } from "./event.controller";
import { fileUploader } from "../../helper/fileUploader";
import { EventValidation } from "./event.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";


const router = express.Router();

router.get("/", EventController.listEvents);
router.get("/:id", EventController.getEvent);
router.post("/suggestion", EventController.getAISuggestions);
router.post("/", fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = EventValidation.createEventValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return EventController.createEvent(req, res, next);
  }
 );
router.patch("/:id", auth(Role.HOST), fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = EventValidation.updateEventValidationSchema.parse(JSON.parse(req.body.data));
    return EventController.updateEvent(req, res, next);
  });
router.delete("/:id", EventController.deleteEvent);

export const EventRoutes = router;