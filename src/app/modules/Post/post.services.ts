import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";
import { CloudFormation } from "aws-sdk";

const addPost = async (req: Request) => {
  try {
    const loginUser = req.user as JwtPayload;
    const videoFiles =
      (req.files as { [fieldname: string]: Express.Multer.File[] })["videos"] ||
      [];
    const photoFiles =
      (req.files as { [fieldname: string]: Express.Multer.File[] })["photos"] ||
      [];
    let payload;
    if (req.body.data) {
      payload = JSON.parse(req.body.data);
    }
    const user = await prisma.user.findFirstOrThrow({
      where: { id: loginUser.id },
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    // Upload photos and videos concurrently
    const uploadPhotoPromises = photoFiles.map((photo) =>
      fileUploader.uploadToDigitalOcean(photo)
    );
    const uploadVideoPromises = videoFiles.map((video) =>
      fileUploader.uploadToDigitalOcean(video)
    );

    const [photoResults, videoResults] = await Promise.all([
      Promise.all(uploadPhotoPromises),
      Promise.all(uploadVideoPromises),
    ]);

    // Save metadata for videos and photos
    const savedPhotos = photoResults.map((result) => ({
      url: result.Location,
    }));
    const savedVideos = videoResults.map((result) => ({
      url: result.Location,
    }));

    const data = {
      ...payload,
      photos: savedPhotos,
      videos: savedVideos,
      userId: loginUser.id, // Associate post with the logged-in user
    };

    const result = await prisma.post.create({ data });

    return result;
  } catch (error: any) {
    console.error("Error uploading files:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Get a post by its ID
const getPostById = async (id: string) => {
  try {
    const post = await prisma.post.findUniqueOrThrow({
      where: { id },
    });
    return post;
  } catch (error: any) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }
};

// Get all posts (optionally paginate)
const getAllPosts = async (page: number = 1, limit: number = 10) => {
  try {
    const posts = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    return posts;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching posts"
    );
  }
};

// Update a post by its ID
const updatePost = async (req: Request) => {
  try {
    const loginUser = req.user as JwtPayload;
    const { id } = req.params; // Assuming post ID is passed in the URL parameters
    const videoFiles =
      (req.files as { [fieldname: string]: Express.Multer.File[] })["videos"] ||
      [];
    const photoFiles =
      (req.files as { [fieldname: string]: Express.Multer.File[] })["photos"] ||
      [];
    let payload;
    if (req.body.data) {
      payload = JSON.parse(req.body.data);
    }

    // Verify the post exists and belongs to the logged-in user
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId: loginUser.id, // Ensures the user owns the post
      },
    });

    if (!existingPost) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Post not found or you do not have permission to update it!"
      );
    }
    // Upload photos and videos concurrently
    const uploadPhotoPromises = photoFiles.map((photo) =>
      fileUploader.uploadToDigitalOcean(photo)
    );
    const uploadVideoPromises = videoFiles.map((video) =>
      fileUploader.uploadToDigitalOcean(video)
    );

    const [photoResults, videoResults] = await Promise.all([
      Promise.all(uploadPhotoPromises),
      Promise.all(uploadVideoPromises),
    ]);

    // Save metadata for new videos and photos
    const savedPhotos = photoResults.map((result) => ({
      url: result.Location,
    }));
    const savedVideos = videoResults.map((result) => ({
      url: result.Location,
    }));

    console.log(savedPhotos, savedVideos);
    // Prepare data for the update
    const updateData = {
      ...payload,
      photos: [...savedPhotos], // Merge new and existing photos
      videos: [...savedVideos], // Merge new and existing videos
    };

    console.log(updateData, savedPhotos, savedVideos);
    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    return updatedPost;
  } catch (error: any) {
    console.error("Error updating post:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Delete a post by its ID
const deletePost = async (id: string) => {

  const existingPost = await prisma.post.findUnique({
    where: { id },
  });
  if (!existingPost) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!1");
  }

  const deletedPost = await prisma.post.delete({
    where: { id: id },
  });
  return deletedPost;
};

export const postServices = {
  addPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
};
