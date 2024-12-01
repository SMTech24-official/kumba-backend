import { Request, Response } from "express";
import { cartService } from "./cart.services";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// Controller to create a cart item
const createCart = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await cartService.createCartItem(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Cart item added successfully",
    data: result,
  });
});

// Controller to get all cart items for a user
const getAllCart = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.getAllCartItemsByUser();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart items retrieved successfully",
    data: result,
  });
});
const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await cartService.getCartItemsByUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart items retrieved successfully",
    data: result,
  });
});

// Controller to get a specific cart item by productId
const getCartItem = catchAsync(async (req: Request, res: Response) => {
  const { userId, productId } = req.params;

  const result = await cartService.getCartItemByProductId(userId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item retrieved successfully",
    data: result,
  });
});

// Controller to update a cart item
const updateCart = catchAsync(async (req: Request, res: Response) => {
  const { userId, productId } = req.params;
  const payload = req.body; // Accepting the full payload to update any part of the cart item

  const result = await cartService.updateCartItem(userId, productId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

// Controller to delete a cart item
const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { userId, productId } = req.query;
console.log(userId, productId);
  const result = await cartService.deleteCartItem(userId as string, productId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item deleted successfully",
    data: result,
  });
});

export const cartController = {
  createCart,
  getCart,
  getAllCart,
  getCartItem,
  updateCart,
  deleteCart,
};
