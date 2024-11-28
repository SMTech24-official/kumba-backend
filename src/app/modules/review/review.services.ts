import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

import { TReview } from "./review.interface";

const createReviewIntoDB = async (payload: TReview) => {
  await prisma.user.findFirstOrThrow({
    where: {
      id: payload.userId,
    },
  });

  await prisma.product.findFirstOrThrow({
    where: {
      id: payload.id,
    },
  });

  // Create the review in the database
  const result = await prisma.review.create({
    data: {
      userId: payload.userId,
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
const getSingleProductReviewsWithUser = async (id: any) => {
  const reviews = await prisma.review.findMany({
    where: {
      productId: id,
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
const deleteReviewIntoDB = async (id: any) => {
  const reviews = await prisma.review.delete({
    where: {
      id: id,
    },
  });

  if (!reviews) {
    throw new ApiError(404, `Review not found`);
  }
const results=await getReviewsWithUser();
  return results;
};

export const reviewService = {
  createReviewIntoDB,
  getReviewsWithUser,
  getSingleProductReviewsWithUser,
  deleteReviewIntoDB,
};
