const mongoose = require("mongoose"),
  googleAuthLib = require("google-auth-library"),
  googleOAuthConfig = require("../helpers/authentication/configuration").google;

const schema = mongoose.Schema({
  name: String,
  email: String,
  dateRegistered: Date,
  googleId: String,
  storages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
  refreshToken: String,
  accessToken: String,
  expiresAt: Date
});

schema.statics.findOrCreate = function(
  accessToken,
  refreshToken,
  params,
  profile
) {
  return new Promise(resolve => {
    const userObj = new this();
    this.findOne({ googleId: profile.id }, (err, result) => {
      if (!result) {
        userObj.googleId = profile.id;
        userObj.name = profile.displayName;
        userObj.email = profile.emails[0].value;
        userObj.basicHttpAuth = false;
        userObj.dateRegistered = Date.now();
        const now = new Date();
        userObj.expiresAt = now.setTime(now.getTime() + 1000 * 3599);
        userObj.refreshToken = refreshToken;
        userObj.accessToken = accessToken;
        userObj.save((error, user) => resolve({ error, user }));
      } else {
        result.refreshToken = refreshToken;
        result
          .save()
          .then(() => this.refreshAccessCode(result.googleId))
          .then(result => resolve({ error: null, user: result }));
      }
    });
  });
};

schema.statics.refreshAccessCode = function(googleId) {
  return new Promise((resolve, reject) => {
    this.findOne({ googleId }, (err, result) => {
      const now = new Date();
      if (now.getTime() < result.expiresAt) {
        const oauth2Client = new googleAuthLib.OAuth2Client(
          googleOAuthConfig.clientID,
          googleOAuthConfig.clientSecret,
          googleOAuthConfig.callbackURL
        );

        oauth2Client.setCredentials({
          refresh_token: result.refreshToken
        });

        oauth2Client.getAccessToken().then(response => {
          this.findOneAndUpdate(
            { googleId },
            {
              $set: {
                accessToken: response.token,
                expiresAt: now.setTime(now.getTime() + 1000 * 3590) // A bit less than 1 hour
              }
            },
            { new: true }
          )
            .then(doc => resolve(doc))
            .catch(err => reject(err));
        });
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = mongoose.model("User", schema);
