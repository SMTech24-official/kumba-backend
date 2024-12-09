import { PrismaClient } from "@prisma/client";
import prisma from "../../../shared/prisma";

// 1. Function to like a comment
const toggleLikeComment = async (userId: string, commentId: string) => {
  // Check if the user has already liked the comment
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  // If the user has already liked the comment, remove the like (unlike)
  if (existingLike) {
    const result = await prisma.commentLike.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { message: "Unlike  successfully", result };
  }

  // If the user has not liked the comment, create a new like
  const result = await prisma.commentLike.create({
    data: {
      userId,
      commentId,
    },
  });

  return { message: " Liked successfully", result };
};

// 2. Function to unlike a comment
const unlikeComment = async (userId: string, commentId: string) => {
  // Find the like entry
  const like = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  if (!like) {
    throw new Error("Like not found");
  }

  // Remove the like
  await prisma.commentLike.delete({
    where: {
      id: like.id,
    },
  });

  return { message: "Unlike  successfully" };
};

// 3. Function to get likes for a specific comment
const getLikesForComment = async (commentId: string, userId: string) => {
  console.log(commentId, userId);
  const likes = await prisma.commentLike.findMany({
    where: {
      commentId,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  // Check if the current user has liked this comment
  const userLiked = likes.some((like) => like.user.id === userId);

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      replies: true, // Include replies (nested comments)
    },
  });

  return {
    comment,
    likesCount: likes.length,
    userLiked,
    replies: comment?.replies || [], // Include nested replies
  };
};

// 4. Function to check if a user has liked a specific comment
const hasUserLikedComment = async (userId: string, commentId: string) => {
  const like = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  return like ? true : false;
};

// 5. Function to get all liked comments for a user
const getLikedCommentsByUser = async (userId: string) => {
  console.log(userId);
  const likedComments = await prisma.commentLike.findMany({
    where: {
      userId,
    },
    include: {
      comment: true,
    },
  });

  return likedComments;
};

// Service object to export all functions
export const CommentLikeService = {
  toggleLikeComment,
  unlikeComment,
  getLikesForComment,
  hasUserLikedComment,
  getLikedCommentsByUser,
};
