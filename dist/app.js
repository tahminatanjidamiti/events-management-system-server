"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = __importDefault(require("./app/config"));
const payment_service_1 = require("./app/modules/payment/payment.service");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const payment_webhook_1 = require("./app/modules/payment/payment.webhook");
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
app.post("/webhook", express_1.default.raw({ type: "application/json" }), payment_webhook_1.paymentWebhookHandler);
// Middleware
app.use((0, cors_1.default)());
app.use((0, compression_1.default)()); // Compresses response bodies for faster delivery
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
node_cron_1.default.schedule('* * * * *', () => {
    try {
        // console.log("Node cron called at ", new Date())
        payment_service_1.PaymentService.cancelUnpaidPayments();
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
});
app.use((0, cors_1.default)({
    origin: config_1.default.frontend_url,
    credentials: true,
}));
app.use("/api/v1", routes_1.default);
app.get("/", (_req, res) => {
    res.send("API is running!!");
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});
app.use(globalErrorHandler_1.default);
app.use(notFound_1.default);
exports.default = app;
