const passport = require("passport");

module.exports = passport.authenticate("google", {
  successRedirect: "/dashboard",
  failureRedirect: "/"
});
