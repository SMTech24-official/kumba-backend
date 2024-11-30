import { string } from "zod";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma, User } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import crypto from "crypto";
import { sendEmail } from "../../../shared/sendEmail";
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";


//! Create a new user in the database.
const createUserIntoDb = async (payload: User) => {
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`
      );
    }
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this username ${payload.email} already exists`
      );
    }
  }
  payload.role = "USER";
  const hashedPassword: string = await bcrypt.hash(
    payload.password!,
    Number(config.bcrypt_salt_rounds)
  );
  const otp = crypto.randomInt(1000, 9999).toString();

  // Set OTP expiration time to 5 minutes from now
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  payload.otp = otp;
  payload.OtpExpires = otpExpires;
  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (result) {
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Email Verification</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                Thank you for registering with us! Please verify your email address by using the OTP code below:
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
                ${otp}
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    If you need assistance, feel free to contact us.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Best Regards,<br/>
                    <span style="font-weight: bold; color: #3f51b5;">Kuumba Team</span><br/>
                    <a href="mailto:support@Kuumba.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
    
      `;

    // Send the OTP to user's email
    await sendEmail(result.email, html, "OTP verifications mail");
  }
  return result;
};

//! reterive all users from the database also searcing anf filetering
const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({
    where: whereConditions,
  });

  if (!result || result.length === 0) {
    return { message: "No Users Found" };
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};


// reterive single users from the database with id
const getUserById = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return result;
};

// Service function to update user profile
const updateProfile = async (user: JwtPayload, payload: User) => {
  // Find user by email and ID (you can change this if you prefer a different method of identification)

  const userInfo = await prisma.user.findUnique({
    where: {
      email: user.email, // This assumes email is a unique identifier
      id: user.id, // Ensure both email and ID match
    },
  });

  // If the user doesn't exist, throw an error
  if (!userInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Update the user profile with the new information
  const result = await prisma.user.update({
    where: {
      email: userInfo.email, // Update by email (you could also use ID here)
    },
    data: {
      firstName: payload.firstName || userInfo.firstName,
      lastName: payload.lastName || userInfo.lastName,
      email: payload.email || userInfo.email,
      profilePic: payload.profilePic || userInfo.profilePic,
      bannerPic: payload.bannerPic || userInfo.bannerPic, // Include bannerPic in update if needed
      summary: payload.summary || userInfo.summary,
      birthday: payload.birthday || userInfo.birthday,
      skills: payload.skills || userInfo.skills,
      phone: payload.phone || userInfo.phone,
      address: payload.address || userInfo.address,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePic: true,
      bannerPic: true,
      summary: true,
      birthday: true,
      skills: true,
      phone: true,
      address: true,
      updatedAt: true,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    );
  }

  return result;
};

// Service function to get user profile by userId
const getUserProfile = async (userId: string) => {
  // Fetch user profile from the database
  const user = await prisma.user.findUnique({
    where: {
      id: userId, // Use the userId to query the user
    },
  });

  // If user is not found, throw an error
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};
// Service function to get user profile by userId
const updateProfileImage = async (req: Request) => {
  const user: JwtPayload | undefined = req.user;

  const file = req.file; // Access the uploaded file.

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile image is required.");
  }

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated.");
  }
  // Upload the image to DigitalOcean (or your cloud storage service)
  const imageUrl = await fileUploader.uploadToDigitalOcean(file);

  // Update the user's profile with the new image URL
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id, // You can use email or other unique identifiers instead of userId if needed.
    },
    data: {
      profilePic: imageUrl.Location,
    },
  });
  return updatedUser;
};

const updateBannerImage = async (req: Request) => {
  const user: JwtPayload | undefined = req.user;

  const file = req.file; // Access the uploaded file.

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile image is required.");
  }

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated.");
  }
  // Upload the image to DigitalOcean (or your cloud storage service)
  const imageUrl = await fileUploader.uploadToDigitalOcean(file);

    // Update the user's profile with the new image URL
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id, // You can use email or other unique identifiers instead of userId if needed.
      },
      data: {
        bannerPic: imageUrl.Location,
      },
    });
return updatedUser
  
};



// update user profile by id 

const updateUserById = async (userId: string, userData: User) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId, // You update by userId
    },
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      summary: userData.summary,
      birthday: userData.birthday,
      skills: userData.skills,
      phone: userData.phone,
      address: userData.address,
    },
    select:{
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      summary: true,
      birthday: true,
      skills: true,
      phone: true,
      address: true,
      updatedAt: true,
    }
  });

  return updatedUser;

}
export const userService = {
  createUserIntoDb,
  getUserById,
  getUsersFromDb,
  updateProfile,
  getUserProfile,
  updateProfileImage,
  updateBannerImage,
 
  updateUserById
  
  
};
