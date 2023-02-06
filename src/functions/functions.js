const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { EmbedBuilder, WebhookClient, CommandInteractionOptionResolver } = require('discord.js');
const Server = require("../modals/server");
var paypal = require('paypal-rest-sdk');

module.exports = {
  ensureAuthenticated(req, res, next) {
    if (req.cookies.token &&  res.locals.user) {
      return next();
    }
    if (req.method === "GET" ) {
      return res.redirect(`/login?uri=${encodeURI(req.path.slice(1))}`);
    } else if (req.method === "POST")
      return res.json({ icon: `error`, content: `you need to be logged in!` });
  },
  sendWebHook(id,user) {
    return new Promise( (resolution, rejection) => {
    Server.findOne({id:id},async (err,result)=>{
      if(!result) return 
      if(result.webhook === '') return 
        try{
          const webhookClient = new WebhookClient({ url: result.webhook.replace('discordapp.com','discord.com') });
          await webhookClient.send({
            content: result.webhook_msg.replace('{user}',user.username).replace('{user-votes}',user.votes).replace(' {server-votes} ',result.votes + 1),
            username: webhookClient.name,
            avatarURL: webhookClient.avatar,
          }).then(t=>{
            console.log(t)
          })
          resolution('Webhook Sent!')
        }catch(err) {
          resolution(err)
        }
      });
    })
  },
  isOwner(id,req,res) {
    return new Promise((resolution, rejection) => {
      fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      })
        .then((res) => res.json())
        .then(async (response) => { 
    Server.findOne({id:id},(err,result)=>{
      if(!result) return 
      if(!res.locals.user.guilds.find(guild=>guild.id === id)) return resolution('401')
      return resolution('200')
      });
    })
    })
  },

  isAdmin(req,res,next) {
   var guild = res.locals.user.guilds.find(g=> g.id ==='1042848358701736036')
   if(guild.owner === true) return next()
   if (req.method === "GET" ) {
    return res.redirect(`/`);
  } else if (req.method === "POST")
    return res.json({ icon: `error`, content: `you don't have permission for that!` });
  }
}