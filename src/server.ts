import express from "express";
import { setupSwagger } from "./lib/swagger/swagger";
import dotenv from "dotenv";
import { initAPIRoutes } from "./routes";
import { errorHandler } from "./utils/errors/error-handler";
import { CustomError } from "./utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();
app.use(express.json());

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

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
  console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
});
