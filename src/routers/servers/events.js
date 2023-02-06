const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
const moment = require("moment")
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports = function(app,url,client,nodecache) {
    function member(client,guild,req){
    return new Promise(function(resolve,reject) {
      if(!guild) resolve('Error,Guild Id not defined!')
      if(!req.cookies.token) resolve('Error,User not logged in!')
      var user = nodecache.get(req.cookies.token)
      if(!user) resolve('Error,User not logged in!')
      else resolve(user)
   })
}
app.post("/participate/event",functions.ensureAuthenticated,(req,res)=>{
    var serverID = req.query.server_id
    var event_id = req.query.event_id
    member(client,serverID,req).then(async user=>{
        if(await !client.guilds.cache.get(serverID).members.cache.get(user.id)) return res.json({icon:'error',content:'User not in this server!'})

      Server.findOne({id:serverID }, (err,result)=>{
        var event = result.events.find(event=>event.id===event_id)
        if(!event) return res.json({icon:'error',content:'event not found!'})
        if(event.participatePeople.find(id=>id.id===user.id) != undefined) return res.json({icon:'error',content:'User already participating this event!'})
        event.participatePeople.push({
            id:user.id
        })
        result.save()
        return res.json({icon:'success',content:'User is now participating this event!'})
    })
    }).catch(error=>{
      console.log(error)
      return res.json({icon:"error",content:error})
    })

})
app.get('/events',(req,res)=>{
   Server.find({},(err,result)=>{
    var events = []
        result.filter(server=>{
        if(server.events.length >= 1){
          server.events.forEach(event=>{
            events.push(event)
          })
        }
      })
       return res.render('./servers/events',{data:events})
    })
  
})
}