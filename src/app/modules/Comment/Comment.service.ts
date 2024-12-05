import { Comment, User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";


// creating nested comments
const addComment = async (user: any, payload: any): Promise<Comment> => {
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated.");
  }

  // Check if the post exists
  const postExists = await prisma.post.findUnique({
    where: { id: payload.postId },
  });

  if (!postExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Post with ID ${payload.postId} not found!`
    );
  }

  // Validate parentId for nested comments
  if (payload.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: payload.parentId },
    });

    if (!parentComment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Parent comment with ID ${payload.parentId} not found!`
      );
    }

    if (parentComment.postId !== payload.postId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Parent comment does not belong to the specified post.`
      );
    }
  }

  // Create and return the comment
  return await prisma.comment.create({
    data: {
      userId: user.id,
      text: payload.text,
      postId: payload.postId,
      parentId: payload.parentId || null, // Ensure null for top-level comments
    },
  });
};
const getCommentById = async (id: string) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid comment ID.");
  }
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!comment) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Comment with ID ${id} not found.`
    );
  }

  return comment;
};

const updateComment = async (
  user: any,
  payload: any,
  commentId: string
): Promise<Comment> => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Comment with ID ${commentId} not found!`
    );
  }

  if (existingComment.userId !== user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this comment."
    );
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: {
      text: payload.text,
    },
  });
  return result;
};

const deleteComment = async (user: any, commentId: string) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Comment with ID ${commentId} not found!`
    );
  }

  if (existingComment.userId !== user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this comment."
    );
  }

  const result = await prisma.comment.delete({ where: { id: commentId } });

  return result;
};

// getting nested comments by post id
const getCommentsByPostId = async (postId: string): Promise<any[]> => {
  const postExists = await prisma.post.findUnique({ where: { id: postId } });

  if (!postExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Post with ID ${postId} not found!`
    );
  }

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null }, // Fetch only top-level comments
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, profilePic: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch nested replies for each top-level comment
  const fetchReplies = async (parentId: string): Promise<any[]> => {
    const replies = await prisma.comment.findMany({
      where: { parentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Recursively fetch replies of replies
    return Promise.all(
      replies.map(async (reply) => ({
        ...reply,
        replies: await fetchReplies(reply.id), // Fetch nested replies
      }))
    );
  };

  return Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      replies: await fetchReplies(comment.id),
    }))
  );
};

export const CommentService = {
  addComment,
  updateComment,
  deleteComment,
  getCommentsByPostId,
  getCommentById,
};
