import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";
import { IUser } from "../user/user.interface";

const fetchDashboardMetaData = catchAsync(async (req: Request & { user?: IUser }, res: Response) => {
  const user = req.user as IUser;
  const result = await MetaService.fetchDashboardMetaData(user);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Meta data retrieved", data: result });
});

export const MetaController = { fetchDashboardMetaData };