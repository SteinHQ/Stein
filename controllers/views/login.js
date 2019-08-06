const Admin = require("../../models/admin");

module.exports = (req, res) => {
  if (req.session.initialLoggedIn) {
    if (req.isAuthenticated()) {
      res.redirect("dashboard");
    } else {
      res.render("googleLogin.ejs");
    }
  } else {
    Admin.countDocuments().then(count => {
      const options = { signUp: false };

      if (count === 0) {
        // Indicate to template that the user needs to sign up
        options.signUp = true;
      }

      res.render("initialLogin.ejs", options);
    });
  }
};
