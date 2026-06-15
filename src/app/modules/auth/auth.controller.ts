import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";

const loginWithEmailAndPassword = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } =
    await AuthService.loginWithEmailAndPassword(req.body);
  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  })
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90,
  })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};

const authWithGoogle = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } =
    await AuthService.authWithGoogle(req.body);
  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  })
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90,
  })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully using Google!",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token");
  }

  const result = await AuthService.refreshToken(refreshToken);
  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  })
  sendResponse(res, {
  statusCode: httpStatus.OK,
  success: true,
  message: "Access token generated successfully!",
  data: {
    accessToken: result.accessToken,
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
  const token = req.headers.authorization?.split(" ")[1] || "";

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