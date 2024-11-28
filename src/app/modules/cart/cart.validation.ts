import { z } from "zod";

const TCartValidationSchema = z.object({
  userId: z.string().length(24, "userId must be a valid MongoDB ObjectId"),
  productId: z
    .string()
    .length(24, "productId must be a valid MongoDB ObjectId"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const cartValidation = {
  TCartValidationSchema,
};
