import { z } from "zod";

export const createAwardSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }), // Title is required and should be a non-empty string
  givenBy: z.string().min(1, { message: "Given By is required" }), // GivenBy is required and should be a non-empty string
  description: z.string().min(1, { message: "Description is required" }), // Description is required and should be a non-empty string
});