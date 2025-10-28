// src/lib/swagger/swagger.config.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

export const setupSwagger = (app: Express) => {
  // Swagger definition
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Food Delivery API",
      version: "1.0.0",
      description: "API documentation for the Food Delivery application",
    },
    servers: [
      {
        url: process.env.APP_BASE_URL,
      },
    ],
  };

  // Options for swagger-jsdoc
  const options: swaggerJSDoc.Options = {
    definition: swaggerDefinition,
    apis: ["./src/routes/index.ts", "./src/routes/*.ts"],
  };

  // Generate specification
  const swaggerSpec = swaggerJSDoc(options);

  // Serve swagger UI at /api-docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log("📘 Swagger docs available at /api-docs");
};
