const path = require("path");

module.exports = {
  name: "stein-core-server",
  script: path.resolve(__dirname, "../index.js"),
  instances: "max",
  output: path.resolve(__dirname, "../out.log"),
  error: path.resolve(__dirname, "../error.log"),
  exec_mode: "cluster",
  env_production: {
    NODE_ENV: "production"
  }
};
