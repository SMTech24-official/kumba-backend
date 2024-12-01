import express from "express";
import { cartController } from "./cart.controller";

const router = express.Router();

// Route to create a cart item
router.post("/", cartController.createCart);

// Route to get all cart items by user
router.get("/", cartController.getAllCart);

router.get("/:userId", cartController.getCart);

// Route to get a specific cart item by userId and productId
router.get("/:userId/product/:productId", cartController.getCartItem);

// Route to update a cart item (e.g., change quantity)
router.put("/:userId/product/:productId", cartController.updateCart);

// Route to delete a cart item by userId and productId
router.delete("/delete-cart", cartController.deleteCart);

export const cartRoutes = router;
