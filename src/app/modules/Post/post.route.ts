import { Router } from "express";
import { postController } from "./post.controller";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

// Add a new post
router.post(
  '/add-post',
  fileUploader.uploadPost,
  auth(UserRole.ADMIN, UserRole.USER),
  postController.addPost
);

// Get all posts
router.get('/posts', postController.getAllPosts);

// Get a post by ID
router.get('/posts/:id', postController.getPostById);

// Update a post by ID
router.put(
  '/update-posts/:id',
  fileUploader.uploadPost,
  auth(UserRole.ADMIN, UserRole.USER),
  postController.updatePost
);

// Delete a post by ID
router.delete(
  '/posts/:id',
  auth(UserRole.ADMIN,UserRole.USER),
  postController.deletePost
);

export const PostRouter = router;
