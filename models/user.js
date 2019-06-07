const mongoose = require("mongoose"),
  refresh = require("passport-oauth2-refresh");

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
        this.refreshAccessCode(result.googleId).then(result =>
          resolve({ error: null, user: result })
        );
      }
    });
  });
};

schema.statics.refreshAccessCode = function(googleId) {
  return new Promise(resolve => {
    this.findOne({ googleId }, (err, result) => {
      const now = new Date();
      if (now.getTime() > result.expiresAt) {
        refresh.requestNewAccessToken(
          "google",
          result.refreshToken,
          (err, accessToken) => {
            if (err) {
              return err;
            } else {
              const newData = result;
              newData.expiresAt = now.setTime(now.getTime() + 1000 * 3599);
              newData.accessToken = accessToken;
              this.findOneAndUpdate(
                { googleId },
                { $set: newData },
                { new: true },
                (err, doc) => {
                  if (err) {
                    return err;
                  }
                  resolve(doc);
                }
              );
            }
          }
        );
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = mongoose.model("User", schema);
