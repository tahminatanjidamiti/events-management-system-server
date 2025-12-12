"use strict";
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // important for signature verification
//   stripeWebhookHandler
// );
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/create-session", (0, auth_1.default)(client_1.Role.USER), payment_controller_1.PaymentController.createCheckoutSession);
exports.PaymentRoutes = router;
