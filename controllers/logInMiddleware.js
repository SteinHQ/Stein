// Send HTTP Code unauthenticated if applicable
module.exports = (req, res, next) => {
  // If the user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // If the user isn't logged in, send error code
  res.sendStatus(401);
};
