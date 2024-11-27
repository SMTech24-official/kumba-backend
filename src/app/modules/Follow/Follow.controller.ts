// Follow.controller: Module file for the Follow.controller functionality.
import { Request, Response } from "express";
import { FollowService } from "./Follow.service";
import catchAsync from "../../../shared/catchAsync"; // Assuming this handles async errors
import sendResponse from "../../../shared/sendResponse"; // Utility to send response
import httpStatus from "http-status";

// Controller to get the list of followers
const getFollowerList = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // Get the user from the authenticated request

  const followers = await FollowService.getFollowerList(user.userId);
  const followerCount = followers.length;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Followers fetched successfully.",
    data: { count: followerCount, followers },
  });
});

// Controller to get the list of pending connection requests
const getPendingRequestsList = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any; // Get the user from the authenticated request

    const pendingRequests = await FollowService.getPendingRequestsList(
      user.userId
    );
    const pendingRequestsCount = pendingRequests.length;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pending connection requests fetched successfully.",
      data: { count: pendingRequestsCount, pendingRequests },
    });
  }
);

// Controller to send a connection request
const sendConnectionRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { followingId } = req.body;
    const user = req.user as any;

    const result = await FollowService.sendConnectionRequest(
      user.userId,
      followingId
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Connection request sent successfully.",
      data: result,
    });
  }
);

// Controller to accept a connection request
const acceptConnectionRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { requestId } = req.body;
    const user = req.user as any;

    const result = await FollowService.acceptConnectionRequest(
      user.id,
      requestId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Connection request accepted.",
      data: result,
    });
  }
);

// Controller to decline a connection request
const declineConnectionRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { requestId } = req.body;
    const user = req.user as any;

    const result = await FollowService.declineConnectionRequest(
      user.id,
      requestId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Connection request declined.",
      data: result,
    });
  }
);

export const FollowController = {
  getFollowerList,
  getPendingRequestsList,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
};
