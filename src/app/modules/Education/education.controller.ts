import { Request, Response } from "express";
import httpStatus from "http-status";
import { educationService } from "./education.services";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";

// Create Education
const createEducation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { instituteName, department, session, description } = req.body;

  const newEducation = await educationService.createEducation({
    instituteName,
    department,
    session,
    description,
    userId: user.id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Education record created successfully!",
    data: newEducation,
  });
});

// Get All Education
const getAllEducationController = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const educationRecords = await educationService.getAllEducation(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education records fetched successfully!",
    data: educationRecords,
  });
});

// Get Education by ID
const getEducationById = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;
  const education = await educationService.getEducationById(educationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education record fetched successfully!",
    data: education,
  });
});

// Update Education
const updateEducation = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;
  const { instituteName, department, session, description } = req.body;

  const updatedEducation = await educationService.updateEducation(educationId, {
    instituteName,
    department,
    session,
    description,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education record updated successfully!",
    data: updatedEducation,
  });
});

// Delete Education
const deleteEducationController = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;
  const deletedEducation = await educationService.deleteEducation(educationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education record deleted successfully!",
    data: deletedEducation,
  });
});

export const educationController = {
  createEducation,
  getAllEducationController,
  getEducationById,
  updateEducation,
  deleteEducationController,
};
