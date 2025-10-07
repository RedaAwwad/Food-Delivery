import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerAutogen from "swagger-autogen";
import swaggerFile from "./swagger-output.json";

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
        url: process.env.APP_BASE_URL,
      },
    ],
    schemes: ["http", "https"],
  },
  apis: ["../../**/*.ts"], // Path to the API docs
};

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: "localhost:3000",
};

const swaggerSpec = swaggerJSDoc(options);
const outputFile = "./swagger-output.json";
const endpointsFiles = ["../../router/router.ts"];

export const setupSwagger = (app: Express) => {
  swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
    console.log("Swagger documentation generated");
  });

  // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
};
