// Follow.routes: Module file for the Follow.routes functionality.
import express from "express";
import { FollowController } from "./Follow.controller";
import auth from "../../middlewares/auth"; 

const router = express.Router();

// Send a connection request
router.post("/request", auth(), FollowController.sendConnectionRequest);

// Accept a connection request
router.put("/accept", auth(), FollowController.acceptConnectionRequest);

// Decline a connection request
router.delete("/decline/:requestId", auth(), FollowController.declineConnectionRequest);

// Get the list of followers and the count
router.get("/followers", auth(), FollowController.getFollowerList);

// Get the list of pending connection requests and the count
router.get("/requests/pending", auth(), FollowController.getPendingRequestsList);

export const FollowRoutes = router;
