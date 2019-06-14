const mongoose = require("../helpers/db"),
  bcrypt = require("bcrypt");

const schema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

schema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("Admin", schema);
