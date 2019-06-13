const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
  authConfig = require("./configuration"),
  User = require("../../models/user");

module.exports = passport => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  const Strategy = new GoogleStrategy(
    {
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackURL
    },
    (accessToken, refreshToken, params, profile, done) => {
      User.findOrCreate(accessToken, refreshToken, params, profile).then(
        ({ error, user }) => {
          return done(error, user);
        }
      );
    }
  );

  passport.use(Strategy);
};
