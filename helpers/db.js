const Mongoose = require("mongoose").Mongoose,
  dotenv = require("dotenv"),
  path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dbConnection = new Mongoose();

dbConnection.Promise = require("bluebird");
dbConnection.connect(process.env.STEIN_MONGO_URL, { useNewUrlParser: true });

module.exports = dbConnection;
