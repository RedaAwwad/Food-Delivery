import express from "express";
import { setupSwagger } from "./lib/swagger/swagger.config";
import dotenv from "dotenv";
import { initAPIRoutes } from "./routes";
import { errorHandler } from "./utils/errors/error-handler";
import { CustomError } from "./utils/errors/custom-error";

dotenv.config();

const app = express();
app.use(express.json());

// setupSwagger(app);

app.get("/", (req, res) => {
  res.send("<h1>Food Delivery API</h1>");
});

initAPIRoutes(app);

app.use((req, res, next) => {
  throw new CustomError({
    statusCode: 404,
    code: "ERR_NF_ROUTE",
    message: "Not Found",
  });
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
  console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
});
