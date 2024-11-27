// Share.service.ts

import { PrismaClient, Share, User } from "@prisma/client";
import httpStatus from "http-status";

const prisma = new PrismaClient();

const SharePost = async (
  user: User,
  payload: { postId: string }
): Promise<Share> => {
  const { postId } = payload;

  // Use a transaction to ensure atomicity
  const [newShare] = await prisma.$transaction([
    // Create a new share entry
    prisma.share.create({
      data: {
        userId: user.id,
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

// const GetSharedPosts = async (user: User) => {
//   // Fetch posts shared by the user
//   const sharedPosts = await prisma.share.findMany({
//     where: { userId: user.id },
//     include: {
//       post: true, // Include the shared post details
//     },
//   });

//   return sharedPosts;
// };

// const GetShareCount = async (postId: string): Promise<number> => {
//   const post = await prisma.post.findUnique({
//     where: { id: postId },
//     select: { shareCount: true },
//   });

//   if (!post) {
//     throw new ApiError(httpStatus.CREATED, "Post not found.");
//   }

//   return post.shareCount;
// };

// const GetTimelinePosts = async (user: User) => {
//   // Fetch posts shared by the user and optionally their friends
//   const timelinePosts = await prisma.share.findMany({
//     where: {
//       OR: [
//         { userId: user.id }, // User's shares
//         // Add logic here if friends' shares are needed
//       ],
//     },
//     include: {
//       post: true, // Include the shared post details
//     },
//   });

//   return timelinePosts;
// };

// const UnsharePost = async (user: User, postId: string): Promise<void> => {
//   // Check if the share exists
//   const existingShare = await prisma.share.findUnique({
//     where: { userId_postId: { userId: user.id, postId } },
//   });

//   if (!existingShare) {
//     throw new ApiError(httpStatus.CREATED, "Share not found.");
//   }

//   // Delete the share
//   await prisma.share.delete({
//     where: { id: existingShare.id },
//   });

//   // Decrement the share count for the post
//   await prisma.post.update({
//     where: { id: postId },
//     data: { shareCount: { decrement: 1 } },
//   });
// };

export const ShareService = {
  SharePost,
//   GetSharedPosts,
//   GetShareCount,
//   GetTimelinePosts,
//   UnsharePost,
};
