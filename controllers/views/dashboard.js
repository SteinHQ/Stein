// Shows the profile page
const User = require("../../models/user");

module.exports = (req, res, next) => {
  if (req.session.initialLoggedIn) {
    User.findById(req.user._id)
      .populate({
        path: "storages"
      })
      .then(user =>
        res.render("dashboard", {
          user
        })
      )
      .catch(err => next(err));
  } else {
    res.redirect("/");
  }
};
