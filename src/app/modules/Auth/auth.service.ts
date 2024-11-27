import { User } from "@prisma/client";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "./emailSender";
import httpStatus from "http-status";
import { sendEmail } from "../../../shared/sendEmail";
import crypto from "crypto";

// user login
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password!
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      userId: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePic: userData.profilePic,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      userId: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePic: userData.profilePic,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );
  return { accessToken: accessToken, refreshToken: refreshToken };
};

// get user profile
const getMyProfile = async (userToken: string) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const userProfile = await prisma.user.findUnique({
    where: {
      id: decodedToken.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,

      email: true,
      profilePic: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return userProfile;
};

// change password

const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password!);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const result = await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  // Step 2: Generate a new OTP and expiration time
  const otp = crypto.randomInt(1000, 9999).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                You requested a new OTP. Please verify your email address by using the OTP code below:
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
  // update user
  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      otp,
      OtpExpires: otpExpires,
    },
  });
  await sendEmail(userData.email, html, "Forgot Password OTP");
  return { message: "Reset password OTP via your email successfully" };
};

// reset password
const resetPassword = async (payload: {
  newPassword: string;
  email: string;
}) => {
  // hash password
  const password = await bcrypt.hash(payload.newPassword, 12);
  const userData = await prisma.user.findFirstOrThrow({
    where: { email: payload.email },
  });
  // update into database
  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password,
    },
  });
  return { message: "Password reset successfully" };
};
const verifyOtp = async (payload: { email: string; otp: string }) => {
  // Check if the user exists
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Check if the user is already verified
  if (user.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are already verified");
  }

  // Check if the OTP is valid and not expired
  if (
    user.otp !== payload.otp || // Assuming OTP is stored as an integer in Prisma
    !user.OtpExpires
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (user.OtpExpires < new Date()) {
    throw new ApiError(httpStatus.FORBIDDEN, "OTP expired"); // Assuming OTP expiration is stored as a Date in Prisma
  }
  // Update the user's OTP and expiration, and mark as verified
  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      otp: "", // Clear the OTP
      OtpExpires: null, // Reset the OTP expiration
      isVerified: true, // Mark as verified
    },
  });

  return { message: "OTP verification successful" };
};

const resendOtp = async (email: string) => {
  // Step 1: Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Check if the user exists
  if (!user) {
    throw new ApiError(404, `User with email ${email} does not exist`);
  }

  // Step 2: Generate a new OTP and expiration time
  const otp = crypto.randomInt(1000, 9999).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  // Step 3: Update the user's OTP and expiration in the database
  await prisma.user.update({
    where: { email },
    data: {
      otp,
      OtpExpires: otpExpires,
    },
  });

  // Step 4: Prepare the email content
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffeb3b;">Resend OTP</span>
            </h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                You requested a new OTP. Please verify your email address by using the OTP code below:
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

  // Step 5: Send the OTP email
  await sendEmail(user.email, html, "Resend OTP Verification");

  // Return success response
  return { message: "OTP resent successfully" };
};

const refreshToken = async (token: string) => {
  // Verify the token to check its validity
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refresh_token_secret as string
  );

  const { userId } = decoded;

  // Check if the user exists in the database
  const user = await prisma.user.findUnique({
    where: {
      id: userId, // Prisma uses `id` instead of `_id` by default
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Check if the user is verified
  if (!user.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, "This user is not active!");
  }

  // Prepare the payload for the new access token
  const jwtPayload = {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePic: user.profilePic,
    email: user.email,
    role: user.role,
  };

  // Create a new access token
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
  };
};

const googleOauthLogin = async (user:User ) => {
  // Check if the user exists
  let existingUser = await prisma.user.findUnique({
    where: { email: user.email }, // Find user by email
  });

  if (!existingUser) {
    // Create a new user if one does not exist
    console.log("Creating new user");

    existingUser = await prisma.user.create({
      data: {
        ...user, // Default role
        isVerified: true, // Mark as verified for OAuth
      },
    });
  }

  // Generate JWT for the logged-in user
  const jwtPayload = {
    userId: existingUser.id,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    profilePic: existingUser.profilePic,
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string, // JWT secret from config
    config.jwt.expires_in as string // Token expiration time
  );

  return {
    accessToken,
  };
};
export const AuthServices = {
  loginUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  refreshToken,
  googleOauthLogin,
};
