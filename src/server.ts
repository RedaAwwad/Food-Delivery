import express from "express";
import { setupSwagger } from "./swagger/swagger";
import { cartRouter } from "./Controller/cart.controller.js";
import dotenv from "dotenv";

dotenv.config();

// Setup Express server
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Food Delivery API</h1>");
});

setupSwagger(app);

app.use("/api/v1/cart", cartRouter);

app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "Not Found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `🚀 Swagger Api Docs running on http://localhost:${PORT}/api-docs`
  );
});
