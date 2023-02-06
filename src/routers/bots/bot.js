const Bots = require(`${__dirname.split('src')[0]}/src/modals/bots`);
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports = function (app,url,client,nodecache) {
    function member(client,guild,req){
        return new Promise(function(resolve,reject) {
          if(!guild) resolve('Error,Guild Id not defined!')
          if(!req.cookies.token) resolve('Error,User not logged in!')
          var user = nodecache.get(req.cookies.token)
          if(!user) resolve('Error,User not logged in!')
          else resolve(user)
       })
    }
  app.get("/bot/:id", (req, res) => {
    var id = req.params.id
    if(!id) return res.send(`No id provided`)
    Bots.findOne({id:id},async  (err, result) => {
        if(!result) return res.send(`bot not found!`)
       res.render(`./bots/bot.ejs`, { bot: result});
    });
  });
  app.post('/bot/review/create/:id',functions.ensureAuthenticated,(req,res)=>{ 
    var id = req.params.id
    if(!id) return res.json({icon:'error',content:'id not defined!'})
    var user = nodecache.get(req.cookies.token)
    Bots.findOne({id:id},(err,result)=>{
        if(!result) return res.json({icon:'error',content:'bot not found!'})
        if(result.reviews.rates.find(u=>u.user.id === user.id )) return res.json({icon:'error',content:'User already reviewed this bot !'})
            result.reviews.rates.push({
                user:{
                    id:user.id,
                    icon:user.avatar,
                    name:user.username
                },
                stars:req.body.rate,
                comment:req.body.comment
            })
        result.reviews.averageStars =  result.reviews.averageStars + req.body.rate
        result.save()
        return res.json({icon:'success',content:'User Reviewed this bot!'})
    })
})
const moment = require("moment")



app.post("/bot/vote",functions.ensureAuthenticated,(req,res)=>{
    var id = req.query.bot
    member(client,id,req).then(user=>{
     Bots.findOne({id:id},(err,result)=>{
         if(result.votes.users.find(u=>u.id === user.id) === undefined){
          result.votes.users.push({
            name:user.username,
            id:user.id,
            votes:1,
            last_vote_date:moment().format('MMMM Do YYYY h:mm:ss a'),
          })
          result.votes.total = result.votes.total + 1
          user.votes = 1
          result.save()
          functions.sendWebHook(id,user).then(response=>{
            console.log(response)
          })
          return res.json({icon:'success',content:'user Voted!'})
         }else {  
            var result_user = result.votes.users.find(u=>u.id === user.id)
            console.log(moment().diff(moment(result_user.last_vote_date, 'MMMM Do YYYY h:mm:ss a'),'days'))
            if(moment().diff(moment(result_user.last_vote_date, 'MMMM Do YYYY h:mm:ss a'),'days') >= 1) {
              result.votes.total = result.votes.total + 1
            result.votes.users[result.votes.users.findIndex(u=>u.id=== user.id)] = {
              name:user.username,
              id:user.id,
              votes: result.votes.users[result.votes.users.findIndex(u=>u.id=== user.id)].votes + 1,
              last_vote_date:moment().format('MMMM Do YYYY h:mm:ss a'),
            }
            user.votes = result.votes.users[result.votes.users.findIndex(u=>u.id=== user.id)].votes 
            result.save()
            functions.sendWebHook(id,user).then(response=>{
              console.log(response)
            })            
            return res.json({icon:"success",content:"user Voted!"})
            }else return res.json({icon:"error",content:"user already vote today!"})
         }
      })
    }).catch(error=>{
      console.log(error)
      return res.json({icon:"error",content:error})
    })

})


};
