const { embedLength } = require("@discordjs/builders");
const { MessageEmbed, MessageAttachment } = require('discord.js');

const Bots = require(`${__dirname.split('src')[0]}/src/modals/bots`);
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports = function (app,url,client,nodecache) {
  app.get("/bots/add", functions.ensureAuthenticated, (req, res) => {
      res.render(`./bots/addBot.ejs`);
  });
  app.post("/bots/verifyId", functions.ensureAuthenticated, async (req, res) => {
   var id= req.query.id
   if(!id) return res.json({icon:'error',content:'No id provided!'})
   try {
    await client.users.fetch(id)
    Bots.findOne({id:id},(err,result)=>{
      if(result != undefined) return res.json({icon:'error',content:'bot already in our database'})
      else return res.json({next:true})
    })
    
   }catch(err) {
    if(err) return res.json({icon:'error',content:'Id is invalid!'})
   }
});
  app.post("/bots/add", functions.ensureAuthenticated, async (req, res) => {
    var id = req.query.id
    if(!id) return res.json({icon:'error',content:'No id provided!'})
    try {
        var bot_obj = await client.users.fetch(id)
        var user  = nodecache.get(req.cookies.token)
        var tags = []
        var bot = {
            id:String,
            name:String,
            avatar:String,
            short_description:String,
            Long_description:String,
            createdBy:{
              name:user.username,
              id:user.id,
              avatar:user.avatar,
            }
        }
        var body= req.body
        for(let i in req.body) {
          
          if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
          if(body[i].name != 'tags' && body[i].name != 'id') {
            if(body[i].name === 'invite' && ! body[i].content.includes('https://discordapp.com/oauth2/authorize'))  return res.json({icon:'error',content:`${body[i].name} is not a proper discord invite !`,el:body[i].id})
          bot[body[i].name] = body[i].content
          }
      }
      req.body['tags'].content.split(",").forEach(tag => {
       tags.push({name:tag})
    });
    bot.id = bot_obj.id
    bot.tags = tags
    bot.name = bot_obj.username
    bot.icon = bot_obj.avatar
    Bots.findOne({id:id},async (err,result)=>{
      if(result != undefined) return res.json({icon:'error',content:'bot already in our database'})

    await Bots.create(bot).then(result=>{ 
      const newBotEmbed = new MessageEmbed()
.setTitle('New Bot added!')
.setURL(`https://discolounge.net/bot/${bot.id}`)
.setThumbnail(`https://cdn.discordapp.com/avatars/${bot.id}/${bot.icon}.png`)
.setColor(5763719)
.setDescription(`<@&1069717896508489789> \n <@${user.id}>, your bot (<@${bot.id}>) was add to our list! \n **__Current Stats__**: \n - Peding (your bot is not verified yet,soon staff members will verify your bot!)`)
client.channels.cache.get('1070157848270614610').send({ embeds: [newBotEmbed] })
      return res.json({icon:'success',content:'bot created!', page:`/bot/${bot.id}`})
    })
    })
       }catch(err) {
        console.log(err)
        if(err) return res.json({icon:'error',content:'Id is invalid!'})
       }


});
};
