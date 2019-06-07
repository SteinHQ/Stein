const Storage = require("../models/storage");

module.exports = (req, res, next) => {
  return Storage.findById(req.params.id)
    .deleteOne()
    .then(() => {
      // Remove storage from user list
      req.user.storages = req.user.storages.filter(
        storage => storage._id !== req.params.id
      );

      return req.user.save();
    })
    .catch(err => next(err));
};
