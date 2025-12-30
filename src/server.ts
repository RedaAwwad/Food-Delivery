import express from "express";
import { setupSwagger } from "./lib/swagger/swagger";
import dotenv from "dotenv";
import { initAPIRoutes } from "./routes";
import { errorHandler } from "./utils/errors/error-handler";
import { CustomError } from "./utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Food Delivery API",
    version: process.env.API_VERSION || "v1",
  });
});

initAPIRoutes(app);

app.use((req, res, next) => {
  throw new CustomError({
    statusCode: StatusCodes.NOT_FOUND,
    message: "Not Found",
  });
});

// Catch any error and format it
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
  console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
});
