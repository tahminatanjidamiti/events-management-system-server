import express from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { fileUploader } from "../../helper/fileUploader";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

// CREATE USER
router.get("/:id", UserController.getUserById);
router.get('/me', UserController.getMyProfile)
router.get("/", UserController.getAllUsers);
router.delete("/:id", auth(Role.ADMIN), UserController.deleteUser);
router.post(
  "/register",
  fileUploader.upload.single("file"),
  validateRequest(UserValidation.createUserValidationSchema), UserController.createUser);
router.patch("/:id", fileUploader.upload.single("file"), validateRequest(UserValidation.updateUserValidationSchema),  auth(Role.ADMIN, Role.HOST, Role.USER), UserController.updateUser);


export const UserRoutes = router;