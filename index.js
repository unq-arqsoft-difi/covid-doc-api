require("dotenv").config();

const logger = console;
const { printRoutes } = require("express-routes");
const app = require("./src/server");

const PORT = process.env.SERVER_PORT || 9004;

app.listen(PORT, () => {
  logger.info("Server running on port %d", PORT);
  if (process.env.NODE_ENV === "development") {
    printRoutes(app);
  }
});
