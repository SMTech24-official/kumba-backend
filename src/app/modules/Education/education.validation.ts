import { z } from "zod";

// Schema for creating a new Education record
export const createEducationSchema = z.object({
  instituteName: z.string().min(1, "Institute name is required"),
  department: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  description: z.string().min(1, "Description is required"),
});


