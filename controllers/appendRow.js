// Append a row to the sheet
const Storage = require("../models/storage"),
  authConfig = require("../helpers/authentication/configuration"),
  googleAuthLib = require("google-auth-library"),
  { google } = require("googleapis"),
  User = require("../models/user");

module.exports = (req, res, next) => {
  const sheets = google.sheets("v4"),
    oAuth2Client = new googleAuthLib.OAuth2Client(
      authConfig.google.clientID,
      authConfig.google.clientSecret
    );

  // Find spreadsheet in storage, then refresh the token of owner
  Storage.findById(req.params.id)
    .then(result => {
      // Refresh user's access token if necessary
      User.refreshAccessCode(result.userGoogleId).then(validatedUser => {
        // Pass the valid user and result to the function which reads and parses the sheets, so as to supply the googleId of the sheet with the appropriate OAuth details.
        appendRow(validatedUser, result);
      });
    })
    .catch(err => {
      res.send(err);
    });

  const appendRow = (validatedUser, queriedSheetDetails) => {
    oAuth2Client.setCredentials({
      access_token: validatedUser.accessToken,
      refresh_token: validatedUser.refreshToken
    });

    // Get the keys
    sheets.spreadsheets.values
      .get({
        auth: oAuth2Client,
        spreadsheetId: queriedSheetDetails.googleId,
        range: req.params.sheet + "!1:1"
      })
      .then(response => {
        const keyArray = response.data.values[0];

        // Sort the query as per key
        const toAppend = req.body,
          allRows = [];

        for (let index = 0; index < toAppend.length; index++) {
          const currentRowObj = toAppend[index],
            currentRow = [];

          // iterate over the keys in order, add the respective values to currentRow
          for (let keyCount = 0; keyCount < keyArray.length; keyCount++) {
            const currentKey = keyArray[keyCount];
            currentRow.push(currentRowObj[currentKey]); // Push the respective value to the row array
          }

          allRows.push(currentRow); // Add this row's array to allRows
        }

        // Now finally append it to the sheet
        const body = { values: allRows };
        sheets.spreadsheets.values
          .append({
            auth: oAuth2Client,
            spreadsheetId: queriedSheetDetails.googleId,
            range: req.params.sheet,
            valueInputOption: "RAW",
            resource: body
          })
          .then(response => {
            res.json({ updatedRange: response.data.updates.updatedRange });
          })
          .catch(err => {
            next(err);
          });
      })
      .catch(next);
  };
};
