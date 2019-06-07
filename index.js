const app = require("./app").app,
  crypto = require("crypto"),
  express = require("express"),
  path = require("path"),
  interfaceRoutes = require("./interfaceRoutes"),
  passport = require("passport"),
  passportInit = require("./helpers/authentication/passportInit"),
  session = require("express-session"),
  cookieParser = require("cookie-parser");

const MongoStore = require("connect-mongo")(session),
  sessionSecret =
    process.env.STEIN_SESSION_SECRET || crypto.randomBytes(6).toString("hex");

let sessionOptions = {
  secret: sessionSecret,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ url: process.env.STEIN_MONGO_URL }),
  cookie: { expires: false }
};

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(cookieParser(sessionSecret));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use("/assets", express.static(path.resolve(__dirname, "./assets")));

// Init passport
passportInit(passport);

interfaceRoutes(app);

app.use((error, req, res, next) => {
  console.error(error);

  // If error has status code specified
  if (error.code) {
    let message = { error: error.message };
    // In case of errors returned by Google Sheets API
    if (error.errors) {
      message.error = error.errors[0].message;
    }

    return res.status(error.code).json(message);
  }

  // If error has only message or has no details
  res.status(500).json({ error: error.message || "An error occurred" });
});

const port = process.env.STEIN_PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
