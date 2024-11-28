import { Router } from "express";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/", reviewController.createReview);
router.get("/", reviewController.getReview);
router.get("/:id", reviewController.getSingleReview);
router.delete("/:id", reviewController.deleteReview);

export const reviewRoutes = router;
