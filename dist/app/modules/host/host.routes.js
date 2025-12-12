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
const router = express_1.default.Router();
router.get("/", host_controller_1.HostController.getAllHosts);
router.post("/request", (0, auth_1.default)(client_1.Role.USER), (req, res, next) => {
    req.body = host_validation_1.HostValidation.createHostSchema.parse(req.body);
    next();
}, host_controller_1.HostController.requestHost);
router.patch("/:id", (0, auth_1.default)(client_1.Role.HOST), (req, res, next) => {
    req.body = host_validation_1.HostValidation.updateHostSchema.parse(req.body);
    next();
}, host_controller_1.HostController.updateHost);
router.patch("/approve/:id", (0, auth_1.default)(client_1.Role.ADMIN), (req, res, next) => {
    req.body = host_validation_1.HostValidation.approvedHostSchema.parse(req.body);
    next();
}, host_controller_1.HostController.approveHost);
exports.HostRoutes = router;
