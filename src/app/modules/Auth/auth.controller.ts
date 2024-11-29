import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { string } from "zod";

const loginUser = catchAsync(async (req: Request, res: Response) => {

  const{refreshToken,accessToken} = await AuthServices.loginUser(req.body);
  res.cookie("refreshToken",refreshToken, { httpOnly: true});
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {accessToken,refreshToken},
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
   
    message: "User Successfully logged out",
    data: null,
  });
});

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;

  const result = await AuthServices.getMyProfile(userToken as string);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});


// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {

  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Check your email!",
      data: null
  })
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {

  await AuthServices.resetPassword( req.body);
  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Reset!",
      data: null
  })
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {

  const result= await AuthServices.verifyOtp(req.body)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "otp verified successfully!",
    data: result
})
});
const resendOtp = catchAsync(async (req: Request, res: Response) => {
const email=req.body.email
 const result= await AuthServices.resendOtp(email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "otp resend successfully!",
    data: result
})
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

 const result= await AuthServices.refreshToken(refreshToken as string)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "otp resend successfully!",
    data: result
})
});


// const googleLogin = catchAsync(async (req, res) => {
//   const result = await AuthServices.googleLogin(req.body as any);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'google Login successfully!',
//     data: result,
//   });
// });
const googleOauthLogin = catchAsync(async (req, res) => {
  const result = await AuthServices.googleOauthLogin(req.user as any);
  ;
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'google Login successfully!',
    data: result,
  });
  res.redirect("")
});

export const AuthController = {
  loginUser,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  refreshToken,
  googleOauthLogin
};
