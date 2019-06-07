// deletes rows which match a condition
const googleAuthLib = require("google-auth-library"),
  { google } = require("googleapis"),
  objectDoesMatch = require("./objectDoesMatch"),
  authConfig = require("../helpers/authentication/configuration"),
  retrieveSheet = require("./retrieveSheet"),
  User = require("../models/user");

module.exports = (req, res, next) => {
  // Get the full response of sheet and then delete
  User.refreshAccessCode(res.locals.sheetIdDbResult.userGoogleId).then(
    validUser => {
      const query = { sheet: req.params.sheet, limit: req.query.limit };

      // Pass the valid user and result to the function which reads and parses the sheets, so as to supply the googleId of the sheet with the appropriate OAuth details.
      retrieveSheet(validUser, res.locals.sheetIdDbResult, query)
        .then(data => {
          getIdAndForward(data, req, res, next);
        })
        .catch(next);
    }
  );
};

// Gets google id and valid user and forwards it for further processing
const getIdAndForward = (parsedSheet, req, res, errorHandler) => {
  // Refresh user's access token if necessary
  User.refreshAccessCode(res.locals.sheetIdDbResult.userGoogleId).then(
    validUser => {
      // Pass the valid user and result to the function which reads and parses the sheets, so as to supply the googleId of the sheet with the appropriate OAuth details.
      afterSheetGoogleId(
        validUser,
        res.locals.sheetIdDbResult,
        parsedSheet,
        req,
        res,
        errorHandler
      );
    }
  );
};

// After getting the google id and valid user, make further changes
const afterSheetGoogleId = (
  validatedUser,
  sheetDbResult,
  parsedSheet,
  req,
  res,
  errorHandler
) => {
  // User data init
  const sheets = google.sheets("v4"),
    oAuth2Client = new googleAuthLib.OAuth2Client(
      authConfig.google.clientID,
      authConfig.google.clientSecret
    );

  oAuth2Client.setCredentials({
    access_token: validatedUser.accessToken,
    refresh_token: validatedUser.refreshToken
  });

  // POSTed data
  const condition = req.body.condition,
    limit = req.body.limit;

  // Loop through all rows, check if it matches. If it does, add the row number (range) to allRanges
  const allRanges = [];
  for (let rowCount = 0; rowCount < parsedSheet.length; rowCount++) {
    const currentRow = parsedSheet[rowCount];
    // If row passes condition, add the row number to allRanges
    if (objectDoesMatch(condition, currentRow)) {
      allRanges.push(rowCount + 1 + 1); // Added one due to one based indexing, and one due to the first row consisting of keys
    }
  }

  const sheetQueryBody = {
    auth: oAuth2Client,
    spreadsheetId: sheetDbResult.googleId,
    ranges: []
  };

  // Create appropriate ranges in format -> Sheet2!1:1
  for (let rangeIndex = 0; rangeIndex < allRanges.length; rangeIndex++) {
    const currentRange = allRanges[rangeIndex],
      parsedRange = req.params.sheet + "!" + currentRange + ":" + currentRange;

    sheetQueryBody.ranges.push(parsedRange);
    // Check limit
    if (sheetQueryBody.ranges.length >= limit) {
      break;
    }
  }

  // Make a query to sheets API
  sheets.spreadsheets.values
    .batchClear(sheetQueryBody)
    .then(result => {
      res.json({
        clearedRowsCount: result.data.clearedRanges
          ? result.data.clearedRanges.length
          : 0
      });
    })
    .catch(errorHandler);
};
