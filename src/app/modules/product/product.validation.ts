import { z } from "zod";

export const TProductValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().url("Invalid image URL"),
  description: z.string().min(1, "Description is required"),
  packageDetails: z.string().min(1, "Package details are required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
});
