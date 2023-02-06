const FormData = require("form-data");

module.exports = function(app,disc_url,redirect) {
    app.get("/login", (req, res) => {
        var params = req.query.uri;
        res.redirect(`${disc_url}&redirect_uri=${redirect}&state=${params}`);
      });
}