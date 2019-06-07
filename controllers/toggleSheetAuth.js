const Storage = require("../models/storage");

module.exports = (req, res, next) => {
  let query = { $unset: { basicHttpAuth: 1 } };

  if (
    req.body.basicAuthToken &&
    req.body.basicAuthToken.length <= 255 &&
    req.body.basicAuthToken.split(":").length === 2
  ) {
    query = { $set: { basicHttpAuth: req.body.basicAuthToken } };
  }

  Storage.findById(req.params.id)
    .updateOne(query)
    .then(() => res.sendStatus(200))
    .catch(err => next(err));
};
