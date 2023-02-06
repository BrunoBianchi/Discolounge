const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
module.exports = function (app) {
  app.get("/", (req, res) => {
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result });
    });
  });
  app.get("/home", (req, res) => {
    Server.find({}, (err, result) => {
      res.render(`./home.ejs`, { data: result });
    });
  });
};
