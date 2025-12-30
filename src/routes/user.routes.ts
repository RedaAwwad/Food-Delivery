import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { asyncHandler } from "../utils/errors/async-handler";
import { userController } from "../controllers/user.controller";

const userRouter = express.Router();

// userRouter.get("/", validateRequest(), asyncHandler(userController.findUserWithRestaurant));

export default userRouter;