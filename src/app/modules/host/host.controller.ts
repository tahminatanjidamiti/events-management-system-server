import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { HostService } from "./host.service";


const requestHost = catchAsync(
  async (req: Request, res: Response) => {
    const result = await HostService.requestToBecomeHost(
      req.body.userId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Host request submitted",
      data: result,
    });
  }
);
const updateHost = catchAsync(async (req: Request, res: Response) => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await HostService.updateHost(req.params.id, req as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host updated successfully",
    data: result,
  });
});
const approveHost = catchAsync(async (req: Request, res: Response) => {
  const result = await HostService.approveHost(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host approved successfully",
    data: result,
  });
});

const getAllHosts = catchAsync(async (_req: Request, res: Response) => {
  const result = await HostService.getAllHosts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hosts retrieved",
    data: result,
  });
});


export const HostController = {
  requestHost,
  updateHost,
  approveHost,
  getAllHosts,
};