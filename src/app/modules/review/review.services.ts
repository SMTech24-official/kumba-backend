import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

import { TReview } from "./review.interface";

const createReviewIntoDB = async (payload: TReview, user: any) => {
  // Create the review in the database
  const result = await prisma.review.create({
    data: {
      userId: user.id,
      productId: payload.productId,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return result;
};

const getReviewsWithUser = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }, // Include the related user data
      Product: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      }, // Include the related product data (if needed)
    },
  });

  if (!reviews) {
    throw new ApiError(404, `Review not found`);
  }

  return reviews;
};
const getSingleProductReviewsWithUser = async (productId: any) => {
  const reviews = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePic: true,
        },
      },
    },
  });

  if (!reviews) {
    throw new ApiError(404, `Review not found`);
  }

  return reviews;
};
const deleteReviewIntoDB = async (id: any) => {
  const reviewExists = await prisma.review.findUnique({
    where: { id },
  });
  if (!reviewExists) {
    throw new ApiError(404, `Review not found`);
  }

  const reviews = await prisma.review.delete({
    where: {
      id: id,
    },
  });

  if (!reviews) {
    throw new ApiError(404, `Unexpected error occured`);
  }
  return reviews;
};

export const reviewService = {
  createReviewIntoDB,
  getReviewsWithUser,
  getSingleProductReviewsWithUser,
  deleteReviewIntoDB,
};
