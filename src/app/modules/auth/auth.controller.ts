import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const loginWithEmailAndPassword = async (req: Request, res: Response) => {
        const result = await AuthService.loginWithEmailAndPassword(req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User loggedin successfully!",
        data: {
            result
        }
    })
}

const authWithGoogle = async (req: Request, res: Response) => {

        const result = await AuthService.authWithGoogle(req.body)
   sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User loggedin successfully!",
        data: {
            result
        }
    })
}

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Check your email!",
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req.headers.authorization || "";

    await AuthService.resetPassword(token, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset!",
        data: null,
    });
});


export const AuthController = {
    loginWithEmailAndPassword,
    authWithGoogle,
    resetPassword,
    forgotPassword,
}