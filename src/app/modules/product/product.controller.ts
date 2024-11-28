import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { productServices } from "./product.services";
import pick from "../../../shared/pick";
import { fileUploader } from "../../../helpars/fileUploader";


// Controller to create a product
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const body = req.body;
  
  // Validate file and body existence
  if (!file) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Image file is required" });
  }
  if (!body) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Product data is required" });
  }

  const parseBodyData = JSON.parse(body?.data);
  const uploadImageLink = await fileUploader.uploadToDigitalOcean(file); // Assuming fileUploader handles image uploads

  const payload = {
    image: uploadImageLink?.Location,
    ...parseBodyData,
  };

  const result = await productServices.createProductIntoDB(payload);
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
  const id = req.params.id;

  const result = await productServices.updateProductByIdInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
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
