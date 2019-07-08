// edit a row which matches given values
const googleAuthLib = require("google-auth-library"),
  { google } = require("googleapis"),
  authConfig = require("../helpers/authentication/configuration"),
  objectDoesMatch = require("./objectDoesMatch"),
  retrieveSheet = require("./retrieveSheet"),
  User = require("../models/user");

module.exports = (req, res, next) => {
  // Get the full response of sheet and then edit
  User.refreshAccessCode(res.locals.sheetIdDbResult.userGoogleId).then(
    validUser => {
      const query = { sheet: req.params.sheet, limit: req.query.limit };

      // Pass the valid user and result to the function which reads and parses the sheets, so as to supply the googleId of the sheet with the appropriate OAuth details.
      retrieveSheet(validUser, res.locals.sheetIdDbResult, query, res.locals.rowLimit)
        .then(data => {
          getIdAndForward(data, req, res, next);
        })
        .catch(next);
    }
  );
};

// After getting the googleId of sheet and a valid user
function afterSheetGoogleId(
  validatedUser,
  sheetDbResult,
  parsedSheet,
  req,
  res,
  errorHandler
) {
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
    toSet = req.body.set,
    limit = req.body.limit ? req.body.limit : parsedSheet.length - 1;

  // Loop through all rows, check if it matches. If it does, add the row number (range) to allRanges
  const allRanges = [];
  for (let rowCount = 0; rowCount < parsedSheet.length; rowCount++) {
    const currentRow = parsedSheet[rowCount];
    // If row passes condition, add the row number to allRanges
    if (objectDoesMatch(condition, currentRow)) {
      allRanges.push(rowCount + 1 + 1); // Added one due to one based indexing, and one due to the first row being of keys
    }
    // Check limit
    if (allRanges.length >= limit) {
      break;
    }
  }

  const sheetQueryBody = {
    valueInputOption: "RAW",
    data: []
  };

  /* Create appropriate data in format -> {
    range: RANGE,
   values: [[VALUES]]
  } */

  const valueArray = [],
    keyOrder = Object.keys(parsedSheet[0]);

  // Get array of values to be set in row in correct order
  for (let keyIndex = 0; keyIndex < keyOrder.length; keyIndex++) {
    const currentKey = keyOrder[keyIndex];
    valueArray.push(toSet[currentKey]);
  }

  for (let i = 0; i < allRanges.length; i++) {
    const rowNum = allRanges[i],
      currentRange = req.params.sheet + "!" + rowNum + ":" + rowNum;
    // Eg: Sheet2!1:1, this yields only one row, so the length of the first dimension of the values array will always be 1
    const dataElem = {
      range: currentRange,
      values: [valueArray]
    };

    sheetQueryBody.data.push(dataElem);
  }

  // Now query the sheets API
  sheets.spreadsheets.values
    .batchUpdate({
      auth: oAuth2Client,
      spreadsheetId: sheetDbResult.googleId,
      resource: sheetQueryBody
    })
    .then(result =>
      res.json({ totalUpdatedRows: result.data.totalUpdatedRows || 0 })
    )
    .catch(errorHandler);
}

// Gets google id and valid user and forwards it for further processing
const getIdAndForward = (parsedSheet, req, res, errorHandler) => {
  // refresh user's access token if necessary
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
