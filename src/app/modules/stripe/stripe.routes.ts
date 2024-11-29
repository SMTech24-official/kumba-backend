import express from "express";
import { PaymentController } from "./stirpe.controller";


const router = express.Router();

// Route to create a payment intent
router.post("/create-intent", PaymentController.createPaymentIntent);

// Route to confirm a payment intent
router.post("/confirm", PaymentController.confirmPaymentIntent);

export const paymentRoutes = router;