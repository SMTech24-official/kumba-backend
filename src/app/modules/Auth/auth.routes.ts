import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authValidation } from "./auth.validation";

const router = express.Router();

// user login route
router.post(
  "/login",
  validateRequest(UserValidation.UserLoginValidationSchema),
  AuthController.loginUser
);

// user logout route
router.post("/logout", AuthController.logoutUser);

router.get(
  "/profile",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMyProfile
);

router.put(
  "/change-password",
  auth(UserRole.ADMIN,UserRole.USER,UserRole.SUPER_ADMIN),
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);


router.post(
  '/forgot-password',
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
 
  AuthController.resetPassword
)

// verify otp
router.patch("/verify-otp", AuthController.verifyOtp)
// resend otp 
router.patch("/resend-otp", AuthController.resendOtp)
// get access token by refresh token

router.post("/refresh-token", AuthController.refreshToken);
export const AuthRoutes = router;
