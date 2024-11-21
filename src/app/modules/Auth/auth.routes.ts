import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authValidation } from "./auth.validation";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import config from "../../../config";
const router = express.Router();
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.client_id as string, // Client
      clientSecret: config.oauth.google.client_secret as string, //
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      
      try {
        const name = profile.displayName.split(" ");
        const firstName = name[0];
        const lastName = name[1];
   const profilePic=profile?.photos?profile.photos[0].value:"";
        const newUser = {
          firstName,
          lastName,
          profilePic,
          email: profile.emails![0].value,
          role: UserRole.USER,
        };
        done(null, newUser); // Pass the new user to the next middleware
      } catch (error) {
        done(error); // Handle error
      }
    }
  )
);
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
  auth(UserRole.ADMIN, UserRole.USER, UserRole.SUPER_ADMIN),
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post(
  "/reset-password",

  AuthController.resetPassword
);

// verify otp
router.patch("/verify-otp", AuthController.verifyOtp);
// resend otp
router.patch("/resend-otp", AuthController.resendOtp);
// get access token by refresh token

router.post("/refresh-token", AuthController.refreshToken);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Request access to user's profile and email
  })
);

// New callback route at /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleOauthLogin
);

//router.post("/google-login", AuthController.googleLogin);
export const AuthRoutes = router;
