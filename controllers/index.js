const logInMiddleware = require("./logInMiddleware"),
  logInRedirect = require("./logInRedirect"),
  firstIndexRender = require("./views/login"),
  viewProfile = require("./views/dashboard"),
  initialLogin = require("./views/initialLogin"),
  addStorage = require("./addStorage"),
  checkAuth = require("./checkAuth"),
  readSheet = require("./readSheet"),
  searchSheet = require("./searchSheet"),
  removeStorage = require("./removeStorage"),
  toggleSheetAuth = require("./toggleSheetAuth"),
  getGoogleAuthorization = require("./getGoogleAuthorization"),
  appendRow = require("./appendRow"),
  editRow = require("./editRow"),
  deleteRow = require("./deleteRow"),
  updateRequestCount = require("./updateRequestCount"),
  passportAuthCallback = require("./passportAuthCallback"),
  { default: ow } = require("ow"),
  logout = require("./logout");

// actual controllers
module.exports = {
  /*---- Interface routes ----*/
  initialLogin,
  login: firstIndexRender, // renders index.js
  logout,

  dashboard: [logInRedirect, viewProfile], // shows the profile page

  addStorage: [
    logInMiddleware,
    (req, res, next) =>
      addStorage(req, res, next).then(() => res.status(200).json({ ok: true }))
  ], // adds a spreadsheet to be used as an API, just provide id

  toggleSheetAuth: [logInMiddleware, toggleSheetAuth], // enables/disables auth for sheet

  removeStorage: [
    logInMiddleware,
    (req, res, next) =>
      removeStorage(req, res, next).then(() =>
        res.status(200).json({ ok: true })
      )
  ], // removes a spreadsheet

  /*---- Core API routes ----*/

  storage: {
    readSheet: [checkAuth, updateRequestCount, readSheet], // reads a sheet
    searchSheet: [checkAuth, updateRequestCount, searchSheet], // searches a sheet
    appendRow: [
      checkAuth,
      (req, res, next) => {
        ow(req.body, ow.array.minLength(1).ofType(ow.object));
        next();
      },
      updateRequestCount,
      appendRow
    ], // add new row(s)
    editRow: [
      checkAuth,
      (req, res, next) => {
        ow(
          req.body,
          ow.object.partialShape({
            condition: ow.object,
            set: ow.object.nonEmpty
          })
        );
        next();
      },
      updateRequestCount,
      editRow
    ], // edit row(s)
    deleteRow: [
      checkAuth,
      (req, res, next) => {
        ow(
          req.body,
          ow.object.partialShape({
            condition: ow.object
          })
        );
        next();
      },
      updateRequestCount,
      deleteRow
    ]
  },

  googleAuth: {
    authorize: getGoogleAuthorization,
    callback: passportAuthCallback
  }
};
