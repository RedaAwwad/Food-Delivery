import express from "express";
import { userController } from "../controllers/user.controller";
import { signUpSchema } from "../validation/user.signup";
import { validateRequest } from "../middleware/validate-request";
import { asyncHandler } from "../utils/errors/async-handler";
import { logInSchema } from "../validation/user.signin";

const userRouter = express.Router();

userRouter.post("/signup", validateRequest(signUpSchema), asyncHandler(userController.signup));
userRouter.put("/login", validateRequest(logInSchema), asyncHandler(userController.login));

export default userRouter;