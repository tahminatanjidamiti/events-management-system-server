"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_router_1 = require("../modules/user/user.router");
const auth_router_1 = require("../modules/auth/auth.router");
const host_routes_1 = require("../modules/host/host.routes");
const event_routes_1 = require("../modules/event/event.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const social_routes_1 = require("../modules/social/social.routes");
const meta_routes_1 = require("../modules/meta/meta.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/user',
        route: user_router_1.UserRoutes
    },
    {
        path: '/auth',
        route: auth_router_1.AuthRoutes
    },
    {
        path: '/host',
        route: host_routes_1.HostRoutes
    },
    {
        path: '/event',
        route: event_routes_1.EventRoutes
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes
    },
    {
        path: '/social',
        route: social_routes_1.SocialRoutes
    },
    {
        path: '/metadata',
        route: meta_routes_1.MetaRoutes
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
