import express from "express";
import { productController } from "./product.controller";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

// Route to create a product
router.post("/create-product", fileUploader?.uploadSingle, productController.createProduct);

// Route to get all products
router.get("/", productController.getAllProducts);

// Route to get a product by ID
router.get("/:id", productController.getProductById);

// Route to update a product
router.put("/:id", productController.updateProduct);

// Route to delete a product by ID
router.delete("/:id", productController.deleteProductById);

export const productsRoutes = router;
