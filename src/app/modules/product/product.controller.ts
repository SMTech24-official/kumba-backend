import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { productServices } from "./product.services";
import pick from "../../../shared/pick";
import { fileUploader } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";

// Controller to create a product
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { images: Express.Multer.File[] }; // Type assertion
  const body = req.body; // Get the body data from the request

  // Validate if files and body are present
  if (!files || !files.images || files.images.length === 0) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Image files are required" });
  }
  if (!body) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Product data is required" });
  }

  const parseBodyData = JSON.parse(body?.data); // Assuming body.data contains the JSON data

  // Process each image in the "images" array and upload to DigitalOcean
  const uploadPromises = files.images.map((file: Express.Multer.File) =>
    fileUploader.uploadToDigitalOcean(file)
  );

  // Wait for all image uploads to finish
  const imageLinks = await Promise.all(uploadPromises);

  // Construct the payload with the uploaded image URLs and the other product data
  const payload = {
    images: imageLinks.map((link) => link.Location), // Extract only the image URL
    ...parseBodyData,
  };

  // Create the product in the database
  const result = await productServices.createProductIntoDB(payload);

  // Send the response back to the client
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product created successfully!",
    data: result,
  });
});

// Controller to get all products
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["title", "searchTerm", "userId"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await productServices.getAllProductsIntoDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

// Controller to get a product by ID
const getProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await productServices.getProductByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// Controller to update a product
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Get the product ID from the route parameters
  const files = req.files as { images: Express.Multer.File[] }; // Type assertion
  const body = req.body; // Get the body data from the request

  // Validate if the product ID is provided
  if (!id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Product ID is required" });
  }

  // Parse the body data
  const parseBodyData = body?.data ? JSON.parse(body.data) : {};

  let imageLinks: string[] = [];
  if (files && files.images && files.images.length > 0) {
    // Process each image in the "images" array and upload to DigitalOcean
    const uploadPromises = files.images.map((file: Express.Multer.File) =>
      fileUploader.uploadToDigitalOcean(file)
    );

    // Wait for all image uploads to finish
    const uploadedImages = await Promise.all(uploadPromises);

    // Extract the image URLs
    imageLinks = uploadedImages.map((link) => link.Location);
  }

  const payload = {
    ...parseBodyData,
    images: [...(parseBodyData.images || []), ...imageLinks],
  };
console.log(payload);
  // Update the product in the database
  const result = await productServices.updateProductByIdInDB(id, payload);

  // Send the response back to the client
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully!",
    data: result,
  });
});

// Controller to delete a product by ID
const deleteProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await productServices.deleteProductFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
};
