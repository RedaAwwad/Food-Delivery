import express from "express";
import { setupSwagger } from "./swagger/swagger";
import { cartRouter } from "./Controller/cart.controller.js";
import dotenv from "dotenv";

dotenv.config();

// Setup Express server
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

setupSwagger(app);

app.get("/", (req, res) => {
  res.send(
    "<h1>Food Delivery API <a href='/api-docs' style='color: green;text-decoration:none;font-size: 1rem;border: 1px solid #ddd;padding:5px 10px;border-radius:5px;'>API Docs</a></h1>"
  );
});

app.use("/api/v1/cart", cartRouter);

app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "Not Found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 Api Docs running on http://localhost:${PORT}/api-docs`);
});
