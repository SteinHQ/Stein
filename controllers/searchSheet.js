// searches a sheet as per key:value pair
const search = require("./search"),
  retrieveSheet = require("./retrieveSheet"),
  User = require("../models/user");

module.exports = (req, res, next) => {
  // get the full response of sheet and then search
  User.refreshAccessCode(res.locals.sheetIdDbResult.userGoogleId).then(
    validUser => {
      const query = {sheet: req.params.sheet};

      // pass the valid user and result to the function which reads and parses the sheets, so as to supply the googleId of the sheet with the appropriate OAuth details.
      retrieveSheet(validUser, res.locals.sheetIdDbResult, query, res.locals.rowLimit)
        .then(data => {
          respond(data, req, res);
        })
        .catch(next);
    }
  );
};

const respond = (fullData, req, res) => {
  const offset = parseInt(req.query.offset) || 0,
    limit = parseInt(req.query.limit) || fullData.length;

  res.json(search(JSON.parse(req.query.search), fullData, limit, offset));
};
