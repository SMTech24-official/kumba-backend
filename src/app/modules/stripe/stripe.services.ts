import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma"; // Assuming Prisma instance is set up
import Stripe from "stripe";
import ApiError from "../../../errors/ApiErrors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Create Payment Intent - Backend Logic
const createPaymentIntent = async (
  userId: string,
  amount: number,
  currency: string,
  productId: string
) => {
  // Check if the user exists
  await prisma.user.findFirstOrThrow({
    where: { id: userId },
  });

  // Create the payment intent with Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    // Save payment intent data in the database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        productId,
        status: "pending", // Status is pending initially
        paymentIntentId: paymentIntent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
   console.log(payment)
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new ApiError(500, "Error creating payment intent");
  }
};

// Confirm Payment Intent - Backend Logic
const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
) => {
  try {
    // Confirm the payment intent using the provided payment method ID
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    // Handle successful payment intent confirmation
    if (paymentIntent.status === "succeeded") {
      // Update payment status in the database
      await prisma.payment.update({
        where: { paymentIntentId: paymentIntent.id },
        data: { status: "succeeded", updatedAt: new Date() },
      });
      return paymentIntent;
    }

    // If payment requires additional actions (e.g., 3D Secure)
    if (paymentIntent.status === "requires_action") {
      return {
        status: "requires_action",
        clientSecret: paymentIntent.client_secret,
      };
    }

    throw new ApiError(400, "Payment confirmation failed");
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    throw new ApiError(500, "Error confirming payment intent");
  }
};

export const paymentServices = {
  createPaymentIntent,
  confirmPaymentIntent,
};
