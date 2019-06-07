const mongoose = require("mongoose");

const schema = mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  userGoogleId: {
    type: String,
    required: true
  },
  basicHttpAuth: String,
  dateCreated: Date,
  title: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Storage", schema);
