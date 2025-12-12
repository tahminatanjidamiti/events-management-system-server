"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const fileUploader_1 = require("../../helper/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// CREATE USER
router.get('/me', user_controller_1.UserController.getMyProfile);
router.get("/", user_controller_1.UserController.getAllUsers);
router.get("/:id", user_controller_1.UserController.getUserById);
router.delete("/:id", (0, auth_1.default)(client_1.Role.ADMIN), user_controller_1.UserController.deleteUser);
router.post("/register", fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = user_validation_1.UserValidation.createUserValidationSchema.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.createUser(req, res, next);
});
router.patch("/:id", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.HOST, client_1.Role.USER), fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = user_validation_1.UserValidation.updateUserValidationSchema.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.updateUser(req, res, next);
});
exports.UserRoutes = router;
