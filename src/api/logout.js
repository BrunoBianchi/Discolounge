const FormData = require("form-data");

module.exports = function(app,disc_url,redirect,nodecache) {
    app.get("/logout", (req, res) => {
        nodecache.del(req.cookies.token);
        res.clearCookie("token");
        res.redirect('/')
      });
}