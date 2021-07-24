const express = require("express"),
  routes = require("./apiRoutes"),
  mongoose = require("./helpers/db"),
  path = require("path"),
  dotenv = require("dotenv"),
  bodyParser = require("body-parser"),
  cors = require("cors");

dotenv.config({path: path.resolve(__dirname, ".env")});

const app = express();

if (process.env.NODE_ENV === "development") {
  const responseTime = require("response-time");
  app.use(responseTime((req, res, time) => console.log("Took time", time)));
}

app.use(cors());
app.use(bodyParser.json({type: () => true}));
app.use(bodyParser.urlencoded({extended: false}));

// Routes
routes(app);

app.use((error, req, res, next) => {
  console.error(error);

  // If error has status code specified
  if (error.code) {
    let message = {error: error.message};
    // In case of errors returned by Google Sheets API
    if (error.errors) {
      message.error = error.errors[0].message;
    }

    return res.status(error.code).json(message);
  }

  // If error has only message or has no details
  res.status(500).json({error: error.message || "An error occurred"});
});

module.exports.app = app;
module.exports.mongoose = mongoose;
