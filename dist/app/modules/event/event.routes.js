"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("./event.controller");
const fileUploader_1 = require("../../helper/fileUploader");
const event_validation_1 = require("./event.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/", event_controller_1.EventController.listEvents);
router.get("/:id", event_controller_1.EventController.getEvent);
router.post("/suggestion", event_controller_1.EventController.getAISuggestions);
router.post("/", fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = event_validation_1.EventValidation.createEventValidationSchema.parse(JSON.parse(req.body.data));
    return event_controller_1.EventController.createEvent(req, res, next);
});
router.patch("/:id", (0, auth_1.default)(client_1.Role.HOST), fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = event_validation_1.EventValidation.updateEventValidationSchema.parse(JSON.parse(req.body.data));
    return event_controller_1.EventController.updateEvent(req, res, next);
});
router.delete("/:id", event_controller_1.EventController.deleteEvent);
exports.EventRoutes = router;
