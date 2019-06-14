// Add a sheet to be used as a storage
const Storage = require("../models/storage"),
  googleAuthLib = require("google-auth-library"),
  googleOAuthConfig = require("../helpers/authentication/configuration").google,
  { google } = require("googleapis");

module.exports = (req, res, next) => {
  const sheets = google.sheets("v4"),
    oauth2Client = new googleAuthLib.OAuth2Client(
      googleOAuthConfig.clientID,
      googleOAuthConfig.clientSecret,
      googleOAuthConfig.callbackURL
    );

  oauth2Client.credentials = {
    access_token: req.user.accessToken,
    refresh_token: req.user.refreshToken
  };

  return sheets.spreadsheets
    .get({
      auth: oauth2Client,
      spreadsheetId: req.body.id
    })
    .then(response => {
      // Add a storage document
      const store = new Storage();
      store.googleId = req.body.id;
      store.dateCreated = Date.now();
      store.userGoogleId = req.user.googleId;
      store.title = response.data.properties.title;
      return store.save({ new: true });
    })
    .then(store => {
      // Add sheet to user's list
      const userAssignment = {};
      userAssignment[store._id] = store.googleId;
      req.user.storages.push(store._id);
      return req.user.save({ new: true });
    })
    .catch(err => {
      next(err);
    });
};
