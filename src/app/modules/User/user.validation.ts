import { z } from "zod";



const CreateUserValidationSchema =  z.object({
  firstName: z.string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name cannot be longer than 50 characters" }),
  lastName: z.string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name cannot be longer than 50 characters" }),
  email: z.string()
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email cannot be longer than 100 characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password cannot be longer than 128 characters" })
});

const UserLoginValidationSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
});

export const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  profilePic: z.string().url().optional(),
  bannerPic: z.string().url().optional(),
  summary: z.string().optional(),
  birthday: z.string().optional(),
  skills: z.array(z.string()).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UserValidation = {
  CreateUserValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
};
