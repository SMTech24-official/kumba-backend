import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";

const createAward = async (payload: {
  title: string;
  givenBy: string;
  description: string;
  userId: string;
}) => {
  if (
    !payload.title ||
    !payload.givenBy ||
    !payload.description ||
    !payload.userId
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }
  const award = await prisma.award.create({
    data: {
      title: payload.title,
      givenBy: payload.givenBy,
      description: payload.description,
      userId: payload.userId, // Assuming the userId is provided for the user relation
    },
  });
  return award;
};

const getAllAwards = async (user: JwtPayload) => {
   
  const awards = await prisma.award.findMany({
    where: { userId: user.id },
  });
  return awards;
};

const getAwardById = async (awardId: string) => {
    const awardExists = await prisma.award.findUnique({where:{id: awardId}});
    if (!awardExists) {
      throw new ApiError(httpStatus.NOT_FOUND, "Award not found");
    }
  const award = await prisma.award.findUnique({
    where: {
      id: awardId,
    },
  });

  if (!award) {
    throw new ApiError(httpStatus.NOT_FOUND, "Award not found");
  }

  return award;
};

const updateAward = async (
  awardId: string,
  payload: {
    title?: string;
    givenBy?: string;
    description?: string;
  }
) => {

    const awardExists = await prisma.award.findUnique({where:{id: awardId}});
    if (!awardExists) {
      throw new ApiError(httpStatus.NOT_FOUND, "Award not found");
    }
  const updatedAward = await prisma.award.update({
    where: {
      id: awardId,
    },
    data: {
      title: payload.title,
      givenBy: payload.givenBy,
      description: payload.description,
    },
  });
  return updatedAward;
};

const deleteAward = async (awardId: string) => {
  const awardExists = await prisma.award.findUnique({where:{id: awardId}});
  if (!awardExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Award not found");
  }
  const deletedAward = await prisma.award.delete({
    where: {
      id: awardId,
    },
  });
  return deletedAward;
};

export const awardService = {
  createAward,
  getAllAwards,
  getAwardById,
  updateAward,
  deleteAward,
};
