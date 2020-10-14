const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND } = require("http-status-codes");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const logger = console;
const morgan = require("morgan");
const swaggerUi = require("express-swaggerize-ui");
const YAML = require("yaml");
const apiDocs = require("../api-docs.json");

const app = express();

function jsonOK(data) {
  this.type("application/json").status(OK).json(data);
}
function yamlOK(data) {
  this.type("application/x-yaml").status(OK).send(YAML.stringify(data));
}

// Middleware
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.text({ type: "application/x-yaml" }));
app.use(
  morgan("common", {
    stream: { write: (message) => logger.info(message) },
    skip: () => process.env.NODE_ENV === "test",
  })
);
app.use((req, res, next) => {
  // Response helpers
  res.jsonOK = jsonOK;
  res.yamlOK = yamlOK;
  next();
});

// Swagger OpenAPI Route Documentation
app.use("/api-docs.json", (_, res) => res.jsonOK(apiDocs));
app.use("/api-docs", swaggerUi());

// Express does not handle 404 as an error (because is not).
// By default it responds with an application/html Content-Type.
// This middleware is used to respond consistently as the rest of the API.
// It must be after all routes (so none of them matched) but before the error middleware.
app.use((req, res) => {
  res.status(NOT_FOUND).json({
    message: "The endpoint does not exist",
    errors: [],
    request: {
      method: req.method.toUpperCase(),
      url: req.originalUrl,
      body: JSON.stringify(req.body),
    },
  });
});

// Error handler middleware
// Must be the last middleware to work properly
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { error, headers, ...info } = err;
  logger.error(error);
  logger.error("Request: %s %s", info.request.method, info.request.url);
  logger.error("%s %s", info.internal.method, info.internal.url);
  logger.error("%s %s", info.status.code, info.status.text);
  logger.error("Headers %s", JSON.stringify(headers, null, 2));
  res // http://cwestblog.com/2017/06/27/javascript-convert-to-integer/
    .status(Math.trunc(err.status.code) || INTERNAL_SERVER_ERROR)
    .json(info);
});

module.exports = app;
