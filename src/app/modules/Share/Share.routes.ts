// Share.routes: Module file for the Share.routes functionality.
import express from "express";
import { ShareController } from "./Share.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Share a post
router.post("/", auth(), ShareController.SharePost);

// Get all shared posts of the authenticated user
router.get("/", auth(), ShareController.GetSharedPosts);

// Get the share count for a specific post
router.get("/share-count/:postId", auth(), ShareController.GetShareCount);

// Get timeline posts (shared posts by user and friends)
router.get("/timeline", auth(), ShareController.GetTimelinePosts);

// Unshare a post
router.delete("/unshare", auth(), ShareController.UnsharePost);

export const ShareRoutes = router;
