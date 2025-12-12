import express, { Request, Response, NextFunction } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { fileUploader } from "../../helper/fileUploader";

const router = express.Router();

// CREATE USER

router.get('/me', UserController.getMyProfile)
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.delete("/:id", UserController.deleteUser);
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
router.patch("/:id", fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.updateUserValidationSchema.parse(JSON.parse(req.body.data));
    return UserController.updateUser(req, res, next);
  }
);


export const UserRoutes = router;