import { Router } from "express";
import { reviewController } from "./review.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/",auth(), reviewController.createReview);
router.get("/", reviewController.getReview);
router.get("/:id", reviewController.getSingleReview);
router.delete("/:id", reviewController.deleteReview);

export const reviewRoutes = router;
