import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { IUser } from "../user/user.interface";

const createCheckoutSession = catchAsync( async (req: Request & { user?: IUser }, res: Response) => {
    const { eventId } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = await PaymentService.createPaymentSession(req.user!.id, eventId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stripe checkout created",
      data: result,
    });
  }
);

export const PaymentController = {
  createCheckoutSession,
}