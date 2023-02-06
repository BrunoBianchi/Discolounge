const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

const fs = require('fs')
module.exports = function (app) {
  app.get("/:lang/",functions.languages, (req, res) => {
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result,lang:res.locals.language });
    });
  });
  app.get("/:lang/home",functions.languages, (req, res) => {
    
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result,lang:res.locals.language});
    });
  });
};
