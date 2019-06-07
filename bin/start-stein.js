#!/usr/bin/env node

const pm2 = require("pm2"),
  config = require("./pm2.config");

let [, , ...args] = process.argv;

function errBack(err, apps) {
  if (err) {
    console.error(err);
    throw err;
  }

  exitHandler();
}

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    return process.exit(2);
  }

  if (args[0] === "start") {
    pm2.start(config, errBack);
  } else if (args[0] === "stop") {
    pm2.killDaemon(errBack);
  }
});

function exitHandler(options, exitCode) {
  pm2.disconnect();
  process.exit();
}

//do something when app is closing
process.on("exit", exitHandler);

//catches ctrl+c event
process.on("SIGINT", exitHandler);

// catches "kill pid"
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);

//catches uncaught exceptions
process.on("uncaughtException", exitHandler);
