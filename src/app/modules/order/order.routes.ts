import express from "express";
import { orderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Route to place an order
router.post("/", auth(), orderController.placeOrder);

// Route to get all orders
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  orderController.getAllOrders
);

//  Route to get all orders my
router.get("/my-order", auth(), orderController.getAllOrderOfUser);

// Route to get a specific order by userId and orderId
router.get("/:orderId", auth(), orderController.getOrderById);

// Route to update the status of an order
router.patch(
  "/:orderId/status",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  orderController.updateOrderStatus
);

export const orderRoutes = router;
