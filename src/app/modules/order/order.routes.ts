import express from "express";
import { orderController } from "./order.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Route to place an order
router.post("/",auth(), orderController.placeOrder);
router.get("/", orderController.getAllOrderOfUser);

// Route to get all orders by user
router.get("/:userId", orderController.getAllOrders);

// Route to get a specific order by userId and orderId
router.get("/:userId/order/:orderId", orderController.getOrder);

// Route to update the status of an order
router.patch("/:orderId/status", orderController.updateOrderStatus);

export const orderRoutes = router;
