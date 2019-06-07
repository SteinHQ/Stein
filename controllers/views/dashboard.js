// Shows the profile page
const User = require("../../models/user");

module.exports = (req, res, next) => {
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
};
