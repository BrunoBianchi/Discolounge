const users_ban = require("../modals/users");
var functions = require("../functions/functions")
var hash = require("randomstring");

module.exports = function(app,url,client,nodechace) {
  app.get("/admin/",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{

    var users = client.guilds.cache.get('1042848358701736036').members.cache
    users_ban.find({},(err,result)=>{
      if(result.length<=0) {
         var ban = [{
            banID:String,
            reason:String,
            userID:Date,
         }]
          users_ban.create(ban).then(()=>{ 
            res.render(`./admin/admin`,{data:result,users})

         })
      }else {
         res.render(`./admin/admin`,{data:result,users})

      }
     })
  })
app.get('/admin/findUser',functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
    try{
        if(Object.keys(req.query).length >= 1) var user = client.guilds.cache.get('1042848358701736036').members.cache.filter(users=>users.user[Object.keys(req.query)].toLowerCase() === Object.values(req.query) && users.user.bot != true || users.user[Object.keys(req.query)].toLowerCase().includes(Object.values(req.query))&& users.user.bot != true)
       else  var user = client.guilds.cache.get('1042848358701736036').members.cache.filter(users=>users.user.bot != true)
        return res.json(user)
    }catch(err){
        console.log(err)
        if(err) return res.json({icon:'error',content:'user not found!'})
    }

})
app.post('/admin/banUser',functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
    var userID = req.query.user
    if(!userID) return res.json({icon:'error',content:'user id not provided!'})
    var reason = req.query.reason 
    if(!reason) return res.json({icon:'error',content:'reason not provided!'})

    try{
        var user = client.guilds.cache.get('1042848358701736036').members.cache.get(userID)
        users_ban.findOne({}, (err,result)=>{
            if(!result.users) result.users = []
            if(result.users.find(user=>user.userID === userID)) return res.json({icon:'warning',content:'user already banned!'})
            else {
                var userban = {
                    userID:userID,
                    reason:reason,
                    banID:hash.generate(20),
                }
                result.users.push(userban)
                var ban_role = client.guilds.cache.get('1042848358701736036').roles.cache.get('1052367327972303020')
               try{
                user.roles.add(ban_role)
                result.save()
                return res.json({icon:'success',content:`user ${user.username} banned!`})

               }catch(err) {
                if(err) return res.json({icon:'error',content:err.toString()})
               }
            }
        })
    }catch(err){
        if(err) return res.json({icon:'error',content:'user not found!'})
    }

})
}