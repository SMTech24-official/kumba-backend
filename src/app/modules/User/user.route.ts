import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

// *!register user
router.post(
  "/register",
  validateRequest(UserValidation.CreateUserValidationSchema),
  userController.createUser
);
// *!get all  user
router.get("/", userController.getUsers);

// *!profile user

// Route to update user profile
router.put(
  "/profile",
  validateRequest(UserValidation.userUpdateSchema), // Validate request payload
  auth(UserRole.ADMIN, UserRole.USER),               // Ensure user is authenticated and authorized (user or admin)
  userController.updateProfile                       // Call the update profile controller
);
// Route to get user profile
router.get('/get-me', 
  auth(UserRole.ADMIN, UserRole.USER), // Ensure user is authenticated
  userController.getUserProfile // Call the controller to get the user profile
);
router.get('/get-all', 
  auth(UserRole.ADMIN), // Ensure user is authenticated
  userController.getAllUsers // Call the controller to get the user profile
);
// get single user profile 

router.get('/:userId', 
  auth(UserRole.ADMIN, UserRole.USER), // Ensure user is authenticated
  userController.getSingleUser // Call the controller to get the user profile
);
// Handle the profile image upload
router.put('/profile-image', fileUploader.upload.single('profilePic'),auth(UserRole.ADMIN, UserRole.USER), userController.updateProfileImage);
router.put('/banner-image', fileUploader.upload.single('bannerPic'),auth(UserRole.ADMIN, UserRole.USER), userController.updateBannerImage);

export const userRoutes = router;
