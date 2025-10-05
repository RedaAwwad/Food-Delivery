import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerAutogen from "swagger-autogen";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food Delivery API",
      version: "1.0.0",
      description: "API documentation for the Food Delivery application",
    },
    servers: [
      {
        url: process.env.APP_BASE_URL || "http://localhost:4000",
      },
    ],
    schemes: ["http", "https"],
  },
  apis: ["./**/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
const outputFile = "./swagger-output.json";
const endpointsFiles = ["../server.ts"];

export const setupSwagger = (app: Express) => {
  app.use("/api-docs.json", (req, res, next) => {
    swaggerAutogen()(outputFile, endpointsFiles, options).then(() => {
      console.log("Swagger documentation generated");
    });
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
