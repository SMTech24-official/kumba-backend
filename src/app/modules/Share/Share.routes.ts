// Share.routes: Module file for the Share.routes functionality.
import express from "express";
import { ShareController } from "./Share.controller";
import auth from "../../middlewares/auth";

const router = express.Router();
router.post("/share",auth(),ShareController.SharePost)


export const ShareRoutes = router;
