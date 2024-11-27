import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ShareService } from "./Share.service";

// Share.controller: Module file for the Share.controller functionality.
const SharePost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await ShareService.SharePost(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post shared successfully!",
    data: result,
  });
});

export const ShareController = {
  SharePost,
};
