const FormData = require("form-data");
const Server = require("../modals/server");

module.exports = function(app,disc_url,redirect) {
    app.post("/guildExist", (req, res) => {
        var id = req.query.id
        if(!id) return res.json(undefined)
       Server.find({id:id},(err,result)=>{
                res.json(result)
        })
      });
}