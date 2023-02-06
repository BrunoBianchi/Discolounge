const Bots = require(`${__dirname.split('src')[0]}/src/modals/bots`);
module.exports = function (app) {
  app.get("/bots", (req, res) => {
    Bots.find({status:{ $ne: 'denied' }}, (err, result) => {
      res.render(`./bots/home_bots.ejs`, { data: result });
    });
  });
};
