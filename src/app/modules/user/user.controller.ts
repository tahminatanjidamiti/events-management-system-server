import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { IUser } from "./user.interface";
import pick from "../../helper/pick";
import { userFilterableFields } from "./user.constant";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched",
    data: result,
  });
});
const getMyProfile = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {

    const user = req.user;

    const result = await UserService.getMyProfile(user as IUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My profile data fetched!",
        data: result
    })
});
const updateUser = catchAsync(async (req: Request, res: Response) => {

  const result = await UserService.updateUser(req.params.id, req as Request);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  deleteUser,
};