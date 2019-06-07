const controllers = require("./controllers");

module.exports = app => {
  /*
    -----
    Storage Public API Routes
    -----
  */

  /*
    Route for giving JSON results for read & search
    URL structure: /?search={"key":"value", ...}
  */
  app.get("/v1/storages/:id/:sheet", controllers.storage.readSheet);

  /*
    Append a new row
    POST body: [{row object}, ...]
  */
  app.post("/v1/storages/:id/:sheet", controllers.storage.appendRow);

  /*
    Edit row(s)
    POST body -> {
      condition: {column:value, ...},
      set: {column: value, ...},
      limit: INTEGER (optional)
    }
  */
  app.put("/v1/storages/:id/:sheet", controllers.storage.editRow);

  /*
    Delete row(s)
    DELETE body -> {
       condition: {column: value, ...},
       limit: INTEGER (optional)
    }
  */
  app.delete("/v1/storages/:id/:sheet", controllers.storage.deleteRow);
};
