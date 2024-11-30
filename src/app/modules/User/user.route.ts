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
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.getUsers
);

// get single users
router.get(
  "/user/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.getUserById
);

// *!profile user

// Route to update user profile
router.put(
  "/profile",
  validateRequest(UserValidation.userUpdateSchema),
  auth(),
  userController.updateProfile
);

// Route to get user profile
router.get("/get-me", auth(), userController.getUserProfile);

// Handle the profile image upload
router.put(
  "/profile-image",
  fileUploader.upload.single("profilePic"),
  auth(),
  userController.updateProfileImage
);
router.put(
  "/banner-image",
  fileUploader.upload.single("bannerPic"),
  auth(),
  userController.updateBannerImage
);
router.put(
  "/user/:userId",
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(UserValidation.updateUserByAdminSchema),
  userController.updateUserById
);

export const userRoutes = router;
