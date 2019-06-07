const Admin = require("../../models/admin");

module.exports = (req, res) => {
  const { username, password } = req.body;

  Admin.countDocuments().then(count => {
    // Create an admin user if this is the first attempt
    if (count === 0) {
      const newAdmin = new Admin({
        username,
        password: Admin.generateHash(password)
      });
      return newAdmin.save().then(() => logInAndRespond(req, res));
    }

    // If not first, then check credentials
    Admin.findOne({ username })
      .then(admin => {
        if (!admin || !admin.validPassword(password)) {
          return res.status(403).json({ error: "Wrong credentials provided" });
        }

        logInAndRespond(req, res);
      })
      .catch(error => res.status(500).json({ error: error.message }));
  });
};

function logInAndRespond(req, res) {
  req.session.initialLoggedIn = true;
  res.sendStatus(200);
}
