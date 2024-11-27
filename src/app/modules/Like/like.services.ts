import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";


const toggleLike = async (id: string, user: any) => {
    const prismaTransaction = await prisma.$transaction(async (prisma) => {
      // Check if the post exists
      const isPostExist = await prisma.post.findUnique({
        where: {
          id: id,
        },
      });
  
      if (!isPostExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
      }
  
      // Check if the favorite already exists for the user
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          postId: id,
        },
      });
  
      let result;
      if (existingLike) {
        // If the like exists, remove the favorite and decrement likeCount
        result = await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
  
        // Decrement the like count on the post
        await prisma.post.update({
          where: {
            id: id,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      } else {
        // If the like doesn't exist, add the favorite and increment likeCount
        result = await prisma.like.create({
          data: {
            userId: user.id,
            postId: id,
          },
        });
  
        // Increment the like count on the post
        await prisma.post.update({
          where: {
            id: id,
          },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      }
  
      return result;
    });
  
    return prismaTransaction;
  };
  

export const LikeService = {
    toggleLike,

};
