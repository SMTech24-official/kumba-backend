import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";

// Create Education
const createEducation = async (payload: {
  instituteName: string;
  department: string;
  session: string;
  description: string;
  userId: string;
}) => {
  if (
    !payload.instituteName ||
    !payload.department ||
    !payload.session ||
    !payload.description ||
    !payload.userId
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const education = await prisma.education.create({
    data: {
      instituteName: payload.instituteName,
      department: payload.department,
      session: payload.session,
      description: payload.description,
      userId: payload.userId, // Assuming the userId is provided for the user relation
    },
  });

  return education;
};

// Get All Education
const getAllEducation = async (user: JwtPayload) => {
  const educationRecords = await prisma.education.findMany({
    where: { userId: user.id },
  });
  return educationRecords;
};

// Get Education by ID
const getEducationById = async (educationId: string) => {
  const education = await prisma.education.findUnique({
    where: { id: educationId },
  });
  if (!education) {
    throw new ApiError(httpStatus.NOT_FOUND, "Education record not found");
  }
  return education;
};

// Update Education
const updateEducation = async (
  educationId: string,
  payload: {
    instituteName?: string;
    department?: string;
    session?: string;
    description?: string;
  }
) => {
  const educationExists = await prisma.education.findUnique({
    where: { id: educationId },
  });
  if (!educationExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Education record not found");
  }

  const updatedEducation = await prisma.education.update({
    where: { id: educationId },
    data: {
      instituteName: payload.instituteName,
      department: payload.department,
      session: payload.session,
      description: payload.description,
    },
  });

  return updatedEducation;
};

// Delete Education
const deleteEducation = async (educationId: string) => {
  const educationExists = await prisma.education.findUnique({
    where: { id: educationId },
  });
  if (!educationExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Education record not found");
  }

  const deletedEducation = await prisma.education.delete({
    where: { id: educationId },
  });

  return deletedEducation;
};

export const educationService = {
  createEducation,
  getAllEducation,
  getEducationById,
  updateEducation,
  deleteEducation,
};
