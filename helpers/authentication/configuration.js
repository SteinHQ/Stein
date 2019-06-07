const dotenv = require("dotenv"),
  path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  google: {
    clientSecret: process.env.STEIN_CLIENT_SECRET,
    clientID: process.env.STEIN_CLIENT_ID,
    callbackURL: process.env.STEIN_CALLBACK_URL
  }
};
