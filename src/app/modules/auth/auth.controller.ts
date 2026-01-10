import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const loginWithEmailAndPassword = async (req: Request, res: Response) => {
    const result = await AuthService.loginWithEmailAndPassword(req.body)
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    })
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    })

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
            id: result.id,
            fullName: result.fullName,
            email: result.email,
            role: result.role,
            picture: result.picture,
            phone: result.phone,
            status: result.status,
            isVerified: result.isVerified,
            bio: result.bio,
            interests: result.interests,
            city: result.city,
            avgRating: result.avgRating,
            reviewCount: result.reviewCount,
        },
    })
}
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const result = await AuthService.refreshToken(refreshToken);
    res.cookie("accessToken", result.accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token genereated successfully!",
        data: {
            message: "Access token genereated successfully!",
        },
    });
});
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
    refreshToken,
    resetPassword,
    forgotPassword,
}