const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

const fs = require('fs')
module.exports = function (app) {
  app.get("/", (req, res) => {
    var lang = req.cookies.lang ? req.cookies.lang:'en'
    res.redirect(`/${lang}/`)
  });
  app.get("/:lang/",functions.languages, (req, res) => {
    if(!req.params.lang) return res.redirect("/en/")
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result,lang:res.locals.language });
    });
  });
  app.get("/:lang/home",functions.languages, (req, res) => {
    if(!req.params.lang) return res.redirect("/en/")
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result,lang:res.locals.language});
    });
  });
};
