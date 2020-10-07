require("dotenv").config();

const logger = console;

if (process.env.NODE_ENV === "development") {
  const fs = require("fs");
  const swaggerJSDoc = require("swagger-jsdoc");

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Covid-api-docs",
        description: "Covid api documentation",
        version: "1.0.0",
      },
    },
    securityDefinitions: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    basePath: "/",
    apis: ["./src/docs/*.yml"],
  };

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerSpec = swaggerJSDoc(options);

  fs.writeFile(
    "api-docs.json",
    JSON.stringify(swaggerSpec, null, 2),
    "utf8",
    (error) => (error ? logger.error(error) : null)
  );
} else {
  logger.info("This process only run in development mode");
}
