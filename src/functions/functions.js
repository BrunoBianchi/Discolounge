const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { EmbedBuilder, WebhookClient, CommandInteractionOptionResolver } = require('discord.js');
const Server = require("../modals/server");
var paypal = require('paypal-rest-sdk');
var fs = require('fs')
const NodeCache = require( "node-cache" );

const langCache = new NodeCache();
module.exports = {
  ensureAuthenticated(req, res, next) {
    if (req.cookies.token &&  res.locals.user) {
      return next();
    }
    if (req.method === "GET" ) {
      return res.redirect(`/${res.locals.user_lang}/login?uri=${encodeURI(req.path.slice(1))}`);
    } else if (req.method === "POST")
      return res.json({ icon: `error`, content: `you need to be logged in!` });
  },
  languages(req, res, next) {
    var lang = req.params.lang
    
    if(!lang) {
      if(!req.cookies.lang) {
        res.cookie('lang','us', { maxAge:365*24*3600, httpOnly: true })
      }
      else {
        return res.redirect(`/${req.cookies.lang}/${req.url}`)
      }
    }else {
      if(!req.cookies.lang || lang != req.cookies.lang ){
        res.cookie('lang',`${lang}`, { maxAge:365*24*3600, httpOnly: true })
        res.locals.language = null
      }
      var cached = langCache.get(lang)
      if(cached)  {
        res.locals.language = cached
        res.locals.user_lang = lang
        return next()
      }else {
        fs.readFile(`./src/languages/${lang}.json`,(err,data)=>{
          if(err) return res.redirect(`/us${req.url.split(lang)[1]}`)
          var parse  = JSON.parse(data)
          res.locals.language = parse
          res.locals.user_lang = lang
          langCache.set(lang, parse)
          return next()
        })
      }

    }

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