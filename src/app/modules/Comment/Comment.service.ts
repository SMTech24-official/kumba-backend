import { Comment, User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";

const addComment = async (user: any, payload: any): Promise<Comment> => {
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated.");
  }
  const postExists = await prisma.post.findUnique({
    where: { id: payload.postId },
  });

  if (!postExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Post with ID ${payload.postId} not found!`
    );
  }

  return prisma.comment.create({
    data: { userId: user.userId, ...payload },
  });
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

  if (existingComment.userId !== user.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this comment."
    );
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: {
      rating: payload.rating,
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

  if (existingComment.userId !== user.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this comment."
    );
  }

  const result = await prisma.comment.delete({ where: { id: commentId } });

  return result;
};

const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const postExists = await prisma.post.findUnique({ where: { id: postId } });

  if (!postExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Post with ID ${postId} not found!`
    );
  }

  return prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const CommentService = {
  addComment,
  updateComment,
  deleteComment,
  getCommentsByPostId,
};
