import express from "express";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

const userRouter = express.Router();

// Apply auth to all role routes
userRouter.use([isAuthenticated, isAuthorized(["ADMIN"])]);

export { userRouter };
