import express from "express";
import { educationController } from "./education.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { createEducationSchema } from "./education.validation";

const router = express.Router();

// Create Education
router.post(
  "/create",
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(createEducationSchema),
  educationController.createEducation
);

// Get All Education
router.get(
  "/:id",
  educationController.getAllEducationController
);

// Get Education by ID
router.get("/:educationId", educationController.getEducationById);

// Update Education
router.put(
  "/:educationId",
  auth(UserRole.ADMIN, UserRole.USER), // Allow admins and users to update education records
  educationController.updateEducation
);

// Delete Education
router.delete(
  "/:educationId",
  auth(UserRole.ADMIN, UserRole.USER), // Allow admins and users to delete education records
  educationController.deleteEducationController
);

export const educationRoutes = router;
