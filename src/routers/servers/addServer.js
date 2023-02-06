var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);
module.exports = function (app,url,client,nodecache) {
app.get("/servers/add", functions.ensureAuthenticated, (req, res) => {
    res.render(`./servers/addServer.ejs`);
});
}