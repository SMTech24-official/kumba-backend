import { Request, Response } from "express";
import { orderService } from "./order.services";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// Controller to place an order
const placeOrder = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.params.userId; // Assuming userId is passed as a parameter
const userId="6749b2b9ce13dcb3e2d67b36";
  const result = await orderService.placeOrder(userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

// Controller to get all orders for a user
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await orderService.getOrdersByUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

// Controller to get a specific order by orderId
const getOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId, userId } = req.params;

  const result = await orderService.getOrderById(orderId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

// Controller to update the status of an order
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body; // Assuming the status is passed in the request body

  const result = await orderService.updateOrderStatus(orderId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

export const orderController = {
  placeOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
};
