import express, { Application, NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import cron from "node-cron"
import { deleteUnverifiedUsers } from "./shared/deleteUnverifiedUser";
import passport from "passport"; 

const app: Application = express();
export const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    success:true,
    statusCode: httpStatus.OK,
    message: "HI Developer!",
  });
});

// Router setup
app.use("/api/v1", router);

// cron.schedule("*/1 * * * *", async () => {
//   try {
//     await deleteUnverifiedUsers();
//     console.log("Checked and deleted unverified users successfully.");
//   } catch (error) {
//     console.error("Error deleting unverified users:", error);
//   }
// });
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session());
// Error handling middleware
app.use(GlobalErrorHandler);

// Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;