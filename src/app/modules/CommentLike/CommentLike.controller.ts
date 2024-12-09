import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CommentLikeService } from "./CommentLike.service";

// 1. Controller to toggle like/unlike a comment
const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // Extract the user from the request (assuming user is authenticated)
  const commentId = req.params.id; // Get the comment ID from the route parameters

  // Call the service to toggle the like status
  const result = await CommentLikeService.toggleLikeComment(user.id, commentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.result, // The like/unlike result
  });
});

// 2. Controller to get all likes for a specific comment
const getLikesForComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const user = req.user as any; 

  // Call the service to get the likes for the comment
  const likes = await CommentLikeService.getLikesForComment(commentId, user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Likes retrieved successfully",
    data: likes, // Return the list of likes and user data
  });
});

// 3. Controller to check if a user has liked a comment
const checkIfUserHasLiked = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // Get the user from the request
  const commentId = req.params.id; // Get the comment ID from the route parameters

  // Call the service to check if the user has liked the comment
  const hasLiked = await CommentLikeService.hasUserLikedComment(
    user.id,
    commentId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: hasLiked
      ? "User has liked this comment."
      : "User has not liked this comment.",
    data: { liked: hasLiked },
  });
});

// 4. Controller to get all liked comments by a specific user
const getLikedCommentsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;
    // Call the service to get all liked comments by the user
    const likedComments = await CommentLikeService.getLikedCommentsByUser(
      user.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Liked comments retrieved successfully",
      data: likedComments, // Return the liked comments
    });
  }
);

export const CommentLikeController = {
  toggleLike, // To like/unlike a comment
  getLikesForComment, // To get all likes for a comment
  checkIfUserHasLiked, // To check if the user has liked a comment
  getLikedCommentsByUser, // To get all liked comments by the user
};
