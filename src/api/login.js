const FormData = require("form-data");
const functions = require("../functions/functions")
module.exports = function(app,disc_url,redirect) {
    app.get("/:lang/login",functions.languages, (req, res) => {
        var params = req.query.uri;
        res.redirect(`${disc_url}&redirect_uri=${redirect}&state=${params}`);
      });
}