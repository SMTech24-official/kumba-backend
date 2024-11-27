import { Request } from "express";
import { v2 as cloudinary } from 'cloudinary';
import config from "../../../config";
import { fileUploader } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
const addPost = async (req: Request) => {
  try {
    const videoFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['videos'] || [];
    const photoFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['photos'] || [];
    let payload
    if(req.body.data){
     payload = JSON.parse(req.body.data);
    }
    const user=await prisma.user.findFirstOrThrow({where:{id:payload.userId}})
    if(!user){
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }
    // Upload videos and photos concurrently
    const uploadPhotoPromises = photoFiles.map((photo) =>fileUploader.uploadToDigitalOcean(photo));
    const uploadVideoPromises = videoFiles.map((video) =>fileUploader.uploadToDigitalOcean(video));

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

    const data={
      ...payload,
      photos: savedPhotos,
      videos: savedVideos,
    }

const result=await prisma.post.create({data:data})

  return result
  } catch (error: any) {
    console.error('Error uploading files:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const postServices = { addPost };
