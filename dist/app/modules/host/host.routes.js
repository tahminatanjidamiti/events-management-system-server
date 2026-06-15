"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const host_controller_1 = require("./host.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const host_validation_1 = require("./host.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.get("/", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.HOST), host_controller_1.HostController.getAllHosts);
router.get("/:id", (0, auth_1.default)(client_1.Role.HOST), host_controller_1.HostController.getHostById);
router.post("/request", (0, auth_1.default)(client_1.Role.USER), (0, validateRequest_1.default)(host_validation_1.HostValidation.createHostSchema), host_controller_1.HostController.requestHost);
router.patch("/approve/:id", (0, auth_1.default)(client_1.Role.ADMIN), (0, validateRequest_1.default)(host_validation_1.HostValidation.approvedHostSchema), host_controller_1.HostController.approveHost);
router.patch("/:id", (0, auth_1.default)(client_1.Role.HOST), (0, validateRequest_1.default)(host_validation_1.HostValidation.updateHostSchema), host_controller_1.HostController.updateHost);
exports.HostRoutes = router;
