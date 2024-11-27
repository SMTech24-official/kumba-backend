import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ShareService } from "./Share.service";

// Share a post
const SharePost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // Assuming req.user is set via middleware
  const result = await ShareService.SharePost(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post shared successfully!",
    data: result,
  });
});

// Get all shared posts of a user
const GetSharedPosts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await ShareService.GetSharedPosts(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shared posts retrieved successfully!",
    data: result,
  });
});

// Get the share count for a specific post
const GetShareCount = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const result = await ShareService.GetShareCount(postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Share count retrieved successfully!",
    data: result,
  });
});

// Get timeline posts (shared posts by user and friends)
const GetTimelinePosts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await ShareService.GetTimelinePosts(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Timeline posts retrieved successfully!",
    data: result,
  });
});

// Unshare a post
const UnsharePost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { postId } = req.body;
  const result = await ShareService.UnsharePost(user, postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post unshared successfully!",
    data: result,
  });
});

export const ShareController = {
  SharePost,
  GetSharedPosts,
  GetShareCount,
  GetTimelinePosts,
  UnsharePost,
};
