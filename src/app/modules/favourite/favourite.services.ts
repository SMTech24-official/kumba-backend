import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";


const toggleFavourite = async (payload: { postId: string }, user: any) => {
  // Check if the post exists
  const isPostExist = await prisma.post.findUnique({
    where: {
      id: payload.postId,
    },
  });

  if (!isPostExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if the favorite already exists for the user
  const existingFavourite = await prisma.favorite.findFirst({
    where: {
      userId: user.id,
      postId: payload.postId,
    },
  });

  if (existingFavourite) {
    // If it exists, remove the favorite
    const result = await prisma.favorite.delete({
      where: {
        id: existingFavourite.id,
      },
    });
    return { result, message: "Favorite item removed successfully." };
  } else {
    // If it doesn't exist, add the favorite
    const result = await prisma.favorite.create({
      data: {
        userId: user.id,
        postId: payload.postId,
      },
    });
    return { result, message: "Favorite item added successfully." };
  }
};

const getAllFavourites = () => {
  return prisma.favorite.findMany({
    include: {
      user: true,
      post: true,
    },
  });
};

const getFavouriteById = (id: string) => {
  return prisma.favorite.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      post: true,
    },
  });
};

const updateFavourite = (id: string, payload: { postId?: string }) => {
  return prisma.favorite.update({
    where: { id },
    data: payload,
  });
};

const deleteFavourite = async (id: string) => {
  const isFavouriteExist = await prisma.favorite.findUnique({
    where: { id },
  });

  if (!isFavouriteExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Favorite not found with the id " + id
    );
  }

  return await prisma.favorite.delete({
    where: { id },
  });
};

const getFavouritesByUser = async (userId: string) => {
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          user: true, // Including the post's author or any other related fields
        },
      },
    },
  });
};

export const FavouriteService = {
  toggleFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouritesByUser,
};
