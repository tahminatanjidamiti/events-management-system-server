import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";

const createCheckoutSession = catchAsync( async (req: Request, res: Response) => {
    const { userId, eventId } = req.body;

    const result = await PaymentService.createPaymentSession(userId, eventId);

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