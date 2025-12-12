import express, { Request, Response, NextFunction } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { fileUploader } from "../../helper/fileUploader";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

// CREATE USER

router.get('/me', UserController.getMyProfile)
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.delete("/:id", auth(Role.ADMIN), UserController.deleteUser);
router.post(
  "/register",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createUserValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createUser(req, res, next);
  }
);
router.patch("/:id", auth(Role.ADMIN, Role.HOST, Role.USER), fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.updateUserValidationSchema.parse(JSON.parse(req.body.data));
    return UserController.updateUser(req, res, next);
  }
);


export const UserRoutes = router;