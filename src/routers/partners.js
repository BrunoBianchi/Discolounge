const Server = require("../modals/server");
var functions = require("../functions/functions")
var paypal = require('paypal-rest-sdk');
const moment = require("moment");
const server = require("../modals/server");

module.exports = function(app,url,client,nodecache) {
app.get("/partners",functions.ensureAuthenticated,(req,res)=>{
    var name = req.query.name
   Server.find({},(err,result)=>{
           var results = []
    results = result.filter(server=>server.owner=== res.locals.user.id)
    res.render('partners',{results})
   })
})
app.post('/partners/sendForm',functions.ensureAuthenticated,(req,res)=>{
    var {serverId} = req.query
    if(isNaN(serverId) === true)   return res.json({icon:'error',content:'Server id not a valid number!'})
    if(!serverId) return res.json({icon:'error',content:'Server id not specify!'})
    var user = client.guilds.cache.get('1042848358701736036').members.cache.get(nodecache.get(req.cookies.token).id)
    if(!user) return res.json({icon:'error',content:'User not in our discord server!'})
    client.guilds.cache.get('1042848358701736036').channels.cache.get('1060612514632695908').send(`
    **Partner Ship Form Recieved** 
        - By: <@${res.locals.user.id}> (${res.locals.user.id})
        - Server: https://discolounge.net/server/${serverId}
    `)
    return res.json({icon:'success',content:'Form Sent to our Staff!'})
})
app.post('/partners/changePartnerServer',functions.ensureAuthenticated,(req,res)=>{
    var {serverId} = req.query
    if(isNaN(serverId) === true)   return res.json({icon:'error',content:'Server id not a valid number!'})
    if(!serverId) return res.json({icon:'error',content:'Server id not specify!'})
    Server.find({owner: res.locals.user.id},(err,result)=>{
        var partnerServer = result.find(server=>server.partner && server.partner === true)
        if(partnerServer && partnerServer.id === serverId) return res.json({icon:'success',content:'Partner Server Changed'})
        if(partnerServer === undefined ){
            Server.findOne({id: serverId},(err,newPartner)=>{ 
                newPartner.partner = true
                newPartner.save()
                return res.json({icon:'success',content:'Partner Server Changed'})
            })

        }else {
            if( partnerServer.id != serverId) {
                Server.findOne({id:partnerServer.id},(err,OldPartner)=>{  
                    OldPartner.partner = false
                    OldPartner.save()
                })
                Server.findOne({id: serverId},(err,newPartner)=>{ 
                    newPartner.partner = true
                    newPartner.save()
                    return res.json({icon:'success',content:'Partner Server Changed'})
                })
            }
        }

    })
})
}