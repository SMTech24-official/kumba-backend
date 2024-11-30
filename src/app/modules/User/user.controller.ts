  import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered successfully!",
    data: result,
  });
});



// get all user form db
const getUsers = catchAsync(async (req: Request, res: Response) => {

  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await userService.getUsersFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});
// get user by id
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userID = req.params.id;
  const result = await userService.getUserById(userID);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});


// Controller to update the user profile
const updateProfile = catchAsync(async (req, res) => {
  // Get the user from the request (authenticated user)
  const user = req.user; // Assuming user is set by the 'auth' middleware
  const payload = req.body;

  // Call the updateProfile service function
  const result = await userService.updateProfile(user as JwtPayload, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully!",
    data: result,
  });
});

// Controller to get user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  const user = req.user as JwtPayload;

  // Call the service function to fetch user profile
  const result = await userService.getUserProfile(user.id );

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully!",
    data: result,
  });
});
// Controller to get user profile
const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  const user = req.user as JwtPayload;

  // Call the service function to fetch user profile
  const result = await userService.updateProfileImage(req);

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile photo upload successfully!",
    data: result,
  });
});
const updateBannerImage = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  const user = req.user as JwtPayload;

  // Call the service function to fetch user profile
  const result = await userService.updateBannerImage(req);

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Cover photo upload successfully!",
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  const user = req.user as JwtPayload;

  // Call the service function to fetch user profile
  const result = await userService.getAllUsers();

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Cover photo upload successfully!",
    data: result,
  });
});
// get single user 

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  
const userId=req.params.userId
  // Call the service function to fetch user profile
  const result = await userService.getSingleUser(userId);

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Cover photo upload successfully!",
    data: result,
  });
});
const updateUserById = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user from req.user
  
const data=req.body
const id =req.params.userId
  // Call the service function to fetch user profile
  const result = await userService.updateUserById(id,data);

  // Send the response with user data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "update user profile!",
    data: result,
  });
});


export const userController = {
  createUser,
  getUserById,
  getUsers,
  updateProfile,
  getUserProfile,
  updateProfileImage,
  updateBannerImage,
  getAllUsers,
  getSingleUser,
  updateUserById

};
