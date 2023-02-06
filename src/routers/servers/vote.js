const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
const moment = require("moment")
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports = function(app,url,client,nodecache,io) {
    function member(client,guild,req){
    return new Promise(function(resolve,reject) {
      if(!guild) resolve('Error,Guild Id not defined!')
      if(!req.cookies.token) resolve('Error,User not logged in!')
      var user = nodecache.get(req.cookies.token)
      if(!user) resolve('Error,User not logged in!')
      else resolve(user)
   })
}
app.post("/vote",functions.ensureAuthenticated,(req,res)=>{
    var id = req.query.server

    member(client,id,req).then(user=>{
      Server.findOne({id:id},(err,result)=>{
         if(result.uvotes.users.find(u=>u.id === user.id) === undefined){
          result.uvotes.users.push({
            name:user.username,
            id:user.id,
            votes:1,
            last_vote_date:moment().format('MMMM Do YYYY h:mm:ss a'),
          })
          result.votes = result.votes + 1
          user.votes = 1
          result.save()
          functions.sendWebHook(id,user).then(response=>{
            console.log(response)
          })
          var data= {
              id:user.id,
              name:user.username,
              votes:user.votes,
              avatar:user.avatar
          }
          io.sockets.in(result.token).emit('vote',data)

          return res.json({icon:'success',content:'user Voted!'})
         }else {  
            var result_user = result.uvotes.users.find(u=>u.id === user.id)
            if(moment().diff(moment(result_user.last_vote_date, 'MMMM Do YYYY h:mm:ss a'),'days') >= 1) {
              result.votes = result.votes + 1
            result.uvotes.users[result.uvotes.users.findIndex(u=>u.id=== user.id)] = {
              name:user.username,
              id:user.id,
              votes: result.uvotes.users[result.uvotes.users.findIndex(u=>u.id=== user.id)].votes + 1,
              last_vote_date:moment().format('MMMM Do YYYY h:mm:ss a'),
            }
            user.votes = result.uvotes.users[result.uvotes.users.findIndex(u=>u.id=== user.id)].votes 
            result.save()
            functions.sendWebHook(id,user).then(response=>{
              console.log(response)
            })       
            var data= {
                id:user.id,
                name:user.username,
                votes:user.votes,
                avatar:user.avatar
            }
            io.sockets.in(result.token).emit('vote',data)
     
            return res.json({icon:"success",content:"user Voted!"})
            }else return res.json({icon:"error",content:"user already vote today!"})
         }
      })
    }).catch(error=>{
      console.log(error)
      return res.json({icon:"error",content:error})
    })

})

}