import { z } from "zod";

const TReviewValidationSchema = z.object({
  userId: z.string().length(24, "userId must be a valid MongoDB ObjectId"), 
  productId: z
    .string()
    .length(24, "productId must be a valid MongoDB ObjectId"), 
  rating: z.number(),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment must be less than 500 characters"),
});

export const reviewValidation = {
  TReviewValidationSchema,
};
