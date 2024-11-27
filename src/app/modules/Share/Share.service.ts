// Share.service.ts

import { PrismaClient, Share, User } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const SharePost = async (user: any, payload: { postId: string }) => {
  const { postId } = payload;
  // Use a transaction to ensure atomicity
  const [newShare] = await prisma.$transaction([
    // Create a new share entry
    prisma.share.create({
      data: {
        userId: user.userId,
        postId,
      },
    }),

    // Increment the share count for the post
    prisma.post.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    }),
  ]);

  return newShare;
};

// get all posts
const GetSharedPosts = async (user: User) => {
  // Fetch posts shared by the user
  const sharedPosts = await prisma.share.findMany({
    where: { userId: user.id },
    include: {
      post: true,
    },
  });

  return sharedPosts;
};

// get post share count
const GetShareCount = async (postId: string) => {
  const result = await prisma.post.findUnique({
    where: { id: postId },
    select: { shareCount: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.CREATED, "Post not found.");
  }

  return result;
};

const GetTimelinePosts = async (user: any) => {
  // Fetch posts shared by the user and optionally their friends
  const timelinePosts = await prisma.share.findMany({
    where: {
      OR: [{ userId: user.userId }],
    },
    include: {
      post: true,
    },
  });

  return timelinePosts;
};

const UnsharePost = async (user: User, postId: string) => {
  const { id: userId } = user;

  // Start a transaction to ensure atomic operations
  const result = await prisma.$transaction(async (prisma) => {
    // Check if the share exists using the OR condition
    const existingShare = await prisma.share.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (!existingShare) {
      throw new ApiError(httpStatus.NOT_FOUND, "Share not found.");
    }

    // Delete the share entry
    const post = await prisma.share.delete({
      where: { id: existingShare.id },
    });

    // Decrement the share count for the post
    await prisma.post.update({
      where: { id: postId },
      data: { shareCount: { decrement: 1 } },
    });

    return post;
  });

  return result;
};

export const ShareService = {
  SharePost,
  GetSharedPosts,
  GetShareCount,
  GetTimelinePosts,
  UnsharePost,
};
