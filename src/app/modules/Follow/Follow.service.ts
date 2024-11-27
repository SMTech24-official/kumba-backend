// Follow.service: Module file for the Follow.service functionality.

import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

// Method to get the list of followers for a user
const getFollowerList = async (userId: string) => {
  const followers = await prisma.follower.findMany({
    where: {
      followingId: userId, // Get users following the given userId
    },
    include: {
      follower: true, // Include the user data of the followers
    },
  });
  return followers;
};

// Method to get the list of pending connection requests for a user
const getPendingRequestsList = async (userId: string) => {
  const pendingRequests = await prisma.follower.findMany({
    where: {
      followingId: userId, // Get requests directed to the user
      status: "PENDING", // Only include pending requests
    },
    include: {
      follower: true, // Include the user data of the request sender
    },
  });
  return pendingRequests;
};

// Method to get the number of followers for a user
const getFollowerCount = async (userId: string): Promise<number> => {
  const followerCount = await prisma.follower.count({
    where: {
      followingId: userId, // Get the count of users following the given userId
    },
  });
  return followerCount;
};

// Method to get the number of pending connection requests for a user
const getPendingRequestsCount = async (userId: string): Promise<number> => {
  const pendingRequestsCount = await prisma.follower.count({
    where: {
      followingId: userId, // Get requests directed to the user
      status: "PENDING", // Only count requests that are still pending
    },
  });
  return pendingRequestsCount;
};

// Method to send a connection request
const sendConnectionRequest = async (userId: string, followingId: string) => {
  const existingRequest = await prisma.follower.findFirst({
    where: {
      followerId: userId,
      followingId: followingId,
    },
  });

  if (existingRequest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Request already sent.");
  }

  const result = await prisma.follower.create({
    data: {
      followerId: userId,
      followingId: followingId,
      status: "PENDING",
    },
  });

  return result;
};

// Method to accept a connection request
const acceptConnectionRequest = async (userId: string, requestId: string) => {
  const request = await prisma.follower.findUnique({
    where: { id: requestId },
  });

  // console.log(request?.followingId,userId);
  if (
    !request ||
    request.followingId !== userId ||
    request.status !== "PENDING"
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid connection request.");
  }

  const result = await prisma.follower.delete({
    where: { id: requestId },
  });

  return result;
};

// Method to decline a connection request
const declineConnectionRequest = async (userId: string, requestId: string) => {
  const request = await prisma.follower.findUnique({
    where: { id: requestId },
  });

  if (
    !request ||
    request.followingId !== userId ||
    request.status !== "PENDING"
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid connection request.");
  }

  await prisma.follower.update({
    where: { id: requestId },
    data: { status: "DECLINED" },
  });
};

export const FollowService = {
  getFollowerList,
  getPendingRequestsList,
  getFollowerCount,
  getPendingRequestsCount,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
};
