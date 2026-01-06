import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware";

const userRouter = express.Router();

// Apply auth to all role routes
userRouter.use(isAuthenticated);

export { userRouter };
