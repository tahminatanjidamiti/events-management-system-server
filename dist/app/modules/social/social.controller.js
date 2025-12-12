"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const social_service_1 = require("./social.service");
const pick_1 = __importDefault(require("../../helper/pick"));
const social_constant_1 = require("./social.constant");
const sendFriendRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.sendFriendRequest(req.user.id, req.body);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.CREATED, success: true, message: "Friend request sent", data: result });
}));
const handleFriendAction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.handleFriendAction(req.user.id, req.body);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Friend request updated", data: result });
}));
const listFriendRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, social_constant_1.friendFilterableFields);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield social_service_1.SocialService.listFriendRequests(filters, options);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Friend requests", meta: result.meta, data: result.data });
}));
const followUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.followUser(req.user.id, req.body);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Follow toggled", data: result });
}));
const listFollows = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, social_constant_1.followFilterableFields);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield social_service_1.SocialService.listFollows(filters, options);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Follows", meta: result.meta, data: result.data });
}));
const toggleSaveEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.toggleSaveEvent(req.user.id, req.body);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Saved event toggled", data: result });
}));
const listSavedEvents = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, social_constant_1.savedEventFilterableFields);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield social_service_1.SocialService.listSavedEvents(filters, options);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Saved events", meta: result.meta, data: result.data });
}));
const createReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.createReview(req.user.id, req.body);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.CREATED, success: true, message: "Review created", data: result });
}));
const listReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, social_constant_1.reviewFilterableFields);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield social_service_1.SocialService.listReviews(filters, options);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Reviews", meta: result.meta, data: result.data });
}));
const listNotifications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, social_constant_1.notificationFilterableFields);
    // ensure only user's notifications when not admin
    if (!filters.userId && req.user)
        filters.userId = req.user.id;
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield social_service_1.SocialService.listNotifications(filters, options);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Notifications", meta: result.meta, data: result.data });
}));
const markNotificationRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield social_service_1.SocialService.markNotificationRead(req.params.id, req.user.id);
    (0, sendResponse_1.default)(res, { statusCode: http_status_1.default.OK, success: true, message: "Notification marked read", data: result });
}));
exports.SocialController = {
    sendFriendRequest,
    handleFriendAction,
    listFriendRequests,
    followUser,
    listFollows,
    toggleSaveEvent,
    listSavedEvents,
    createReview,
    listReviews,
    listNotifications,
    markNotificationRead,
};
