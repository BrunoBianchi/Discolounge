const market = require("../modals/market");
var functions = require("../functions/functions")
var hash = require("randomstring");
const NodeCache = require("node-cache");
const users = require("../modals/users");
const { keys } = require("object-hash");

module.exports = function(app,url,client,nodecache) {
app.get("/market",(req,res)=>{
    market.find({},(err,result)=>{
      res.render(`./market/market`,{data:result})
   })
})

  app.get("/market/admin",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
    market.find({},(err,result)=>{
        if(result.length<=0) {
            var item ={
                title:String,
                content:String,
                id:String,
                keys:[{
                 id:String
                }],
                value:Number
            }
            market.create(item).then(()=>{
                res.render(`./admin/market-admin`,{data:''})

            })

        }else {
            res.render(`./admin/market-admin`,{data:result})

        }
     })
  })
  app.post("/market/admin/create",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
      market.findOne({}, (err,result)=>{
                  var body = req.body
               var item ={
                   title:String,
                   content:String,
                   id:hash.generate(7),
                   keys:[],
                   value:Number
               }
               for(let i in req.body) {
                   if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
                   item[body[i].name] = body[i].content
                  }
                  var keys = req.body.keys.content.split(',')
                  item.keys =[]
                  for(let i in keys) {
                    item.keys.push({
                        id:keys[i]
                    })
                  }
               result.items.push(item)
               result.save()
               return res.json({icon:'success',content:`Item created!`})
      })
 })

 app.post("/market/buyitem",functions.ensureAuthenticated,(req,res)=>{
    var id = req.query.id
    if(!id) return res.json({icon:'error',content:'id not specify!'})
    
    market.findOne({}, (err,result)=>{
        var item = result.items.find(item=>item.id === id)
        if(!item)return res.json({icon:'error',content:'item not found!'})
        var user = nodecache.get(req.cookies.token)
        if(!client.guilds.cache.get('1042848358701736036').members.cache.get(user.id)) return res.json({icon:'error',content:"User must be in our discord server in order to continue"})
        if(user.coins < item.value) return res.json({icon:'error',content:"User don't have money"})
        if(item.keys.length <= 0) return res.json({icon:'error',content:"No more keys in the stock"})
        var key = item.keys[ Math.floor(Math.random() * item.keys.length)]
        
        var index = item.keys.findIndex(k=>k.id === key.id)
        if(index === undefined) return res.json({icon:'error',content:'no key not found!'})
        users.findOne({userID:res.locals.user.id},(err,result_user)=>{
            console.log(result_user)
            if(!result_user) return res.json({icon:'error',content:'User not found'})
            user.coins = user.coins - item.value
            if(result_user.coins < item.value) return res.json({icon:'error',content:"User don't have money"})
            result_user.coins = user.coins
            item.keys.splice(index,1)
            
            nodecache.set(req.cookies.token,user,365*24*3600)
            result.save()
            result_user.save()
            client.channels.cache.get('1042848589627527169').send(`User: ${user.username}#${user.discriminator} (${user.id}) bought key from ${item.title} key: (${key.id})`)
            client.users.cache.get(user.id).send(`Hey,**${user.username}**. You bought a key of **${item.title}**,here it is: ||${key.id}||`)
            return res.json({icon:'success',content:`Item Bought`,key:key.id})

        })
    })
})
 app.post("/market/admin/addKeys/:id",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
    var id = req.params.id
    var body = req.body
    if(!id) return 
    market.findOne({id:id}, (err,result)=>{
                
             var item ={
                 title:String,
                 content:String,
                 id:hash.generate(7),
                 keys:[{
                  id:String
                 }],
                 value:Number
             }
             for(let i in req.body) {
                 if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
                   item[body[i].name] = body[i].content
                }
             result.items.push(item)
             result.save()
             return res.json({icon:'success',content:`Item created!`})
    })
})
}