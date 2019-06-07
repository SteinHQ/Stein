// Middleware for routes to make sure a user is logged in, redirect if not
module.exports = (req, res, next) => {
  // If the user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // If the user isn't logged in, redirect to the home page
  res.redirect("/");
};
