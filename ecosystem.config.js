module.exports = {
  apps: [
    {
      name: "stein-core-server",
      script: "./index.js",
      instances: "max",
      output: "./out.log",
      error: "./error.log",
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
