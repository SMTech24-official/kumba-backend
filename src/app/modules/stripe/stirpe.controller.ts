import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import { paymentServices } from "./stripe.services";

// Controller to create a payment intent
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { userId, amount, currency, productId } = req.body;  // Destructure values from the request body

  if (!userId || !amount || !currency || !productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All fields are required.");
  }

  const { clientSecret, paymentId }:any = await paymentServices.createPaymentIntent(
    userId,
    amount,
    currency,
    productId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment intent created successfully.",
    data: { clientSecret, paymentId },  // Send clientSecret and paymentId in response
  });
});

// Controller to confirm a payment intent
const confirmPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId, paymentMethodId } = req.body;  // Destructure values from the request body

  if (!paymentIntentId || !paymentMethodId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment intent ID and Payment method ID are required.");
  }

  const paymentIntent = await paymentServices.confirmPaymentIntent(
    paymentIntentId,
    paymentMethodId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment confirmed successfully.",
    data: paymentIntent,  // Send the payment intent details in response
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPaymentIntent,
};
