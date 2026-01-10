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
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
// CREATE USER
router.get("/:id", user_controller_1.UserController.getUserById);
router.get('/me', user_controller_1.UserController.getMyProfile);
router.get("/", user_controller_1.UserController.getAllUsers);
router.delete("/:id", (0, auth_1.default)(client_1.Role.ADMIN), user_controller_1.UserController.deleteUser);
router.post("/register", fileUploader_1.fileUploader.upload.single("file"), (0, validateRequest_1.default)(user_validation_1.UserValidation.createUserValidationSchema), user_controller_1.UserController.createUser);
router.patch("/:id", fileUploader_1.fileUploader.upload.single("file"), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserValidationSchema), (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.HOST, client_1.Role.USER), user_controller_1.UserController.updateUser);
exports.UserRoutes = router;
