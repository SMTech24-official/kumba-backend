import express from "express";
import { cartController } from "./cart.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Route to create a cart item
router.post("/", auth(), cartController.createCart);

// Route to get all cart items by user
// router.get("/", cartController.getAllCart);

router.get("/", auth(), cartController.getCart);

// Route to get a specific cart item by userId and productId
// router.get("/:userId/product/:productId", cartController.getCartItem);

// Route to update a cart item (e.g., change quantity)
router.put("/:userId/product/:productId", cartController.updateCart);
router.put("/update-quantity", auth(), cartController.updateCartQuantity);

// Route to delete a cart item by userId and productId
router.delete("/:cartId",auth(), cartController.deleteCart);

export const cartRoutes = router;
