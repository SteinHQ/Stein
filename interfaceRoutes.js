const controllers = require("./controllers");

module.exports = app => {
  /*
    -----
    UI API Routes
    (Yes, I realise that they are against the accepted URL naming conventions of RESTful APIs, but these routes are of the least concern)
    -----
  */

  // Route for home page
  app.get("/", controllers.login);

  // Check initial login credentials
  app.post("/initial-login", controllers.initialLogin);

  // Route for dashboard UI
  app.get("/dashboard", controllers.dashboard);

  // Route for adding sheet
  app.post("/storages", controllers.addStorage);

  // Route for enabling/disabling auth for sheet
  app.put("/storage/:id", controllers.toggleSheetAuth);

  // Route for removing sheet
  app.delete("/storages/:id", controllers.removeStorage);

  // Route for logging out
  app.get("/logout", controllers.logout);

  /*
    -----
    Google Authentication Routes
    -----
  */

  app.get("/auth/google", controllers.googleAuth.authorize);

  // The callback after google has authenticated the user
  app.get("/auth/google/callback", controllers.googleAuth.callback);
};
