import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { postServices } from "./post.services";

// get user profile
const addPost = catchAsync(async (req, res) => {
   
  
    const result = await postServices.addPost(req);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "add post successfully",
      data: result,
    });
  });

 export const postController={
    addPost
  }