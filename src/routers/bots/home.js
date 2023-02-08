const Bots = require(`${__dirname.split('src')[0]}/src/modals/bots`);
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports = function (app) {
  app.get("/:lang/bots",functions.languages, (req, res) => {
    Bots.find({status:{ $ne: 'denied' }}, (err, result) => {
      res.render(`./bots/home_bots.ejs`, { data: result });
    });
  });
};
