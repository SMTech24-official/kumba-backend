import express from "express";
import { CommentLikeController } from "./CommentLike.controller";
import auth from "../../middlewares/auth"; // Auth middleware to protect routes

const router = express.Router();

// Route to get all liked comments by the current user
// GET /user/likes
router.get("/user/likes", auth(), CommentLikeController.getLikedCommentsByUser); // Authenticated users can see their liked comments
// Route to toggle like/unlike a comment
// POST /comments/:id/like
router.post("/:id", auth(), CommentLikeController.toggleLike); // Only authenticated users can toggle like

// Route to get all likes for a specific comment
// GET /comments/:id/likes
router.get("/:id/likes",auth(), CommentLikeController.getLikesForComment); // No authentication required to see likes

// Route to check if the current user has liked a comment
// GET /comments/:id/has-liked
router.get("/:id/has-liked", auth(), CommentLikeController.checkIfUserHasLiked); // Authenticated users can check their like status

export const CommentLikeRoutes = router;
