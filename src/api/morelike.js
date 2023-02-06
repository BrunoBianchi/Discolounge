const Server = require("../modals/server");
const Bots = require("../modals/bots");

module.exports = function(app,disc_url,redirect) {
    app.get("/servers/morelike", (req, res) => {
        var tags = req.query.tags.split(',')
        if(!tags) return res.send('no tags added!')
        Server.find({},(err,result)=>{ 
        var results= []
         result.filter(server=>{server.tags.some(tag=>{
          if(tags.indexOf(tag.name)>=0) {
            return results.push(server)
          }
         } 
          )})
           return res.json({server:results})
        })
      });
      app.get("/bots/morelike", (req, res) => {
        var tags = req.query.tags.split(',')
        if(!tags) return res.send('no tags added!')
        Bots.find({},(err,result)=>{ 
        var results= []
         result.filter(server=>{server.tags.some(tag=>{
          if(tags.indexOf(tag.name)>=0) {
            return results.push(server)
          }
         } 
          )})
           return res.json({server:results})
        })
      });
}