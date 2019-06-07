// gets google OAuth authorization
const passport = require("passport");

module.exports = passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/spreadsheets"],
  accessType: "offline",
  prompt: "consent"
});
