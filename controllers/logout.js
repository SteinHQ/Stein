// logs out a user
module.exports = (req, res) => {
  req.session.initialLoggedIn = false;
  req.logout();
  res.redirect("/");
};
