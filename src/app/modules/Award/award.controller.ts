import { Request, Response } from "express";
import httpStatus from "http-status";
import { awardService } from "./award.services";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";


// Create Award
const createAward = catchAsync(async(req, res) => {
const  user=req.user as JwtPayload
    const { title, givenBy, description,  } = req.body;
    const newAward = await awardService.createAward({
      title,
      givenBy,
      description,
      userId:user.id
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Award created successfully!",
      data: newAward,
    });

})

// Get All Awards
const getAllAwardsController = catchAsync(async(req, res) => {
const user= req.user as JwtPayload
    const awards = await awardService.getAllAwards(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Awards fetched successfully!",
      data: awards,
    });

})

// Get Award by ID
const getAwardById = catchAsync(async(req, res) => {

    const { awardId } = req.params;
    const award = await awardService.getAwardById(awardId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Award fetched successfully!",
      data: award,
    });
  
})

// Update Award
const updateAward = catchAsync(async(req, res) => {
  
    const { awardId } = req.params;
    const { title, givenBy, description } = req.body;
    const updatedAward = await awardService.updateAward(awardId, {
      title,
      givenBy,
      description,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Award updated successfully!",
      data: updatedAward,
    });
 
})

// Delete Award
const deleteAwardController = catchAsync(async(req, res) => {

    const { awardId } = req.params;
    const deletedAward = await awardService.deleteAward(awardId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Award deleted successfully!",
      data: deletedAward,
    });
 
})

export const awardController = {
    createAward,
  getAllAwardsController,
  getAwardById,
  updateAward,
  deleteAwardController,
};
