const Mongoose = require("mongoose").Mongoose;

const dbConnection = new Mongoose();

dbConnection.Promise = require("bluebird");
dbConnection.connect(process.env.STEIN_MONGO_URL, { useNewUrlParser: true });


module.exports = dbConnection;
