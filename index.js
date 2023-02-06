
  
    var express = require('express')
    var app = express()
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    require("dotenv").config()
    var moment = require("moment")
    const redirect = `https://discolounge.net/callback`;
    const url = `https://discolounge.net/`
    var cookies = require('cookie-parser');
    var bodyParser = require("body-parser");
    const fs = require("fs") 
    var path = require('path') 
    const axios = require('axios');
    const multer = require("multer")
    const Server = require("./src/modals/server");
    const users = require("./src/modals/users");
    var CLIENT_ID = 967394045779402753
    var  CLIENT_SECRET = "2gemSgon2RZ9q4s8hZujjJEzYCBhMdz_"
    var hash = require("randomstring");
    var cron = require('node-cron');
    const robots = require('express-robots-txt')
    var MarkdownIt = require('markdown-it'),
        md = new MarkdownIt();
        const NodeCache = require( "node-cache" );
        const nodecache = new NodeCache();
        const helmet = require("helmet");
    var disc_url = `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=identify%20guilds&response_type=code&prompt=none`;
    app
    .set('views', path.join(__dirname, './src/views/dashboard'))

    .set('views', path.join(__dirname, './src/views/servers'))
    .set('views', path.join(__dirname, './src/views'))
    .use(express.static(__dirname + '/src/public/'))
    .use(express.static(__dirname + '/src/public/bots/'))

    .use("/backgrounds", express.static(__dirname + "/src/public/backgrounds"))
    .use("/icons", express.static(__dirname + "/src/public/icons"))
    
    
    .set('view engine', 'ejs')
    .use(cookies())
    .use(bodyParser.json())
    .use(express.json())
    app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter())
    .use((req, res, next) => {
        if(req.cookies.token) {
            var user  = nodecache.get(req.cookies.token)
                if(user) {
                    users.findOne({userID:user.id},(err,result)=>{
                        if(!result) res.locals.user = null
                        else {
                            user.coins = result.coins
                            res.locals.user = user
                            
                        }
                      
                        res.locals.url = req.originalUrl;
                        res.locals.host = req.get("host");
                        res.locals.protocol = req.protocol;
                        res.locals.path_url = `${req.protocol}://${req.get("host")}${
                          req.originalUrl
                        }`;
                        return next();
                      })
                }else {
                    res.locals.user = null
                    res.locals.url = req.originalUrl;
                    res.locals.host = req.get("host");
                    res.locals.protocol = req.protocol;
                    res.locals.path_url = `${req.protocol}://${req.get("host")}${
                      req.originalUrl
                    }`;
                    return next();
                }
    
            
    
            
        }else {
            res.locals.user = null
            res.locals.url = req.originalUrl;
            res.locals.host = req.get("host");
            res.locals.protocol = req.protocol;
            res.locals.path_url = `${req.protocol}://${req.get("host")}${
              req.originalUrl
            }`;
            return next();
    
        }
    
      })
      .use('/callback',async (req, res, next) =>{
        if(!req.cookies.token)  {
           res.locals.user = null
           return next();
        }
     await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        }, 
      })
        .then((res) => res.json())
        .then((response) => { 
          res.locals.user = response
          var user =  client.guilds.cache.get('1042848358701736036').members.cache.get(response.id)
          if(user && user.roles.cache.some(role => role.id === '1060586376782954576')) response.partner = true
          else response.partner = false
          users.findOne({id:response.id},async (err,result)=>{
            if(!result) {
                var hashs = hash.generate(15)
                user.userID = response.id
                user.referralCode=hashs
                user.coins = 0
                response.userID = response.id
                response.referralCode=hashs
                response.coins = 0
                await users.create(user)
                nodecache.set(req.cookies.token,response,365*24*3600)
                return next();
            }else {
                response.userID = result.userID
                response.referralCode = result.referralCode
                response.coins = result.coins
                nodecache.set(req.cookies.token,response,365*24*3600)
                return next();
            }
          })
        
    
        }).catch(err=>{
            console.log(err)
            res.send(`error:${err.toString()}`)
        }) 
    })
    .use('/callback',async (req, res, next) =>{
      if(!req.cookies.token)  {
         res.locals.user = null
         return next();
      }
      await fetch("https://discordapp.com/api/v6/users/@me/guilds", {
          headers: {
        Authorization: `Bearer ${req.cookies.token}`,
      },
    })
      .then((res) => res.json())
      .then((response) => { 
        if(!response) return res.redirect('/login')
        if(!  response.filter) return res.redirect('/login')
        var servers =  response.filter(server=>new Permissions(`${server.permissions}`).toArray().some(permission=> permission === 'MANAGE_GUILD'))
        var user =  nodecache.get(req.cookies.token)
        var referralCode = (req.query.state != undefined && req.query.state.split(';')[1] != undefined) ? req.query.state.split(';')[1].split('referralCode=')[1] : ''
            users.findOne({userID:user.id}, async (err,result)=>{ 
                if(!result) {
                    user.userID = user.id
                    user.referralCode=hash.generate(15)
                    user.coins = 0
                    users.findOne({referralCode:referralCode}, async (err,referred_user)=>{  
                        if(referred_user && referred_user.userID != user.id) {
                            user.referral = referralCode
                            referred_user.referrals = referred_user.referrals + 1
                            referred_user.save()
                            await users.create(user)
                            user.guilds =  servers
                            res.locals.user.guilds = servers
                            
                            nodecache.set(req.cookies.token,user,365*24*3600)
                            return next();
                        } else {
                            user.referral = ''
                            await users.create(user)
                            user.guilds =  servers
                            res.locals.user.guilds = servers
                            
                            nodecache.set(req.cookies.token,user,365*24*3600)
                            return next();
                        }
                    })
    
                }else {
                    if(!result.referral) {
                        users.findOne({referralCode:referralCode}, async (err,referred_user)=>{  
                            if(referred_user && referred_user.userID != user.id){
                                result.referral= referralCode
                                referred_user.referrals=  referred_user.referrals + 1
                                result.save()
                                referred_user.save()
                                user.referral = referralCode
                                user.guilds =  servers
                                res.locals.user.guilds = servers
                                
                                nodecache.set(req.cookies.token,user,365*24*3600)
                                return next();
                            }else {
                                user.referral = ' '
                                user.guilds =  servers
                                res.locals.user.guilds = servers
                                
                                nodecache.set(req.cookies.token,user,365*24*3600)
                                return next();
                            }
                        })
                    }else {
                        user.referral = result.referral
                        user.guilds =  servers
                        res.locals.user.guilds = servers
                        
                        nodecache.set(req.cookies.token,user,365*24*3600)
                        return next();
                    }
                }
    
            })
                
      }).catch(err=>{
          console.log(err)
          res.send(`error:${err.toString()}`)
      })
    })
    /*/
    .use((req, res, next) =>{
        if(!req.cookies.token) return next()
         var user =  nodecache.get(req.cookies.token)
        if(!user) return next()
        else {
            users.findOne({userID:user.id}, (err,result)=>{
                if(!result) return
                if(result.users.length<=0) return next()
                if(!result.users.find(u=>u.userID === user.id)) return next()
                else return res.send(`User Banned And cannot user our services anymore! <br> Reason: ${result.users.find(u=>u.userID === user.id).reason} <br> ban id: ${result.users.find(u=>u.userID === user.id).banID} <br> ban date: ${result.users.find(u=>u.userID === user.id).banDate}`)
            })
    
        }
    })
    /*/
    app.locals.moment = moment; 
    app.locals.md = md;

    fs.readdir("./src/routers/servers",(err,files)=>{
        if(files.length <= 0) return
        for(let i in files) {
            try{
                require(`./src/routers/servers/${files[i]}`)(app,url,client,nodecache,io )
                console.log(`Router (Servers) ${files[i]} online `)
            }catch(error) {
                console.log(`Router (Servers) error ${files[i]}: ${error}`)
            }
        }
    
    
    })
    fs.readdir("./src/routers/",(err,files)=>{
        if(files.length <= 0) return
        for(let i in files) {
            if(files[i] != 'servers'&&files[i] != 'bots') {
                try{
                    require(`./src/routers/${files[i]}`)(app,url,client,nodecache,io )
                    console.log(`Router ${files[i]} online `)
                }catch(error) {
                    console.log(`Router  error ${files[i]}: ${error}`)
                }
            }

        }
    
    
    })
    fs.readdir("./src/routers/bots",(err,files)=>{
        if(files.length <= 0) return
        for(let i in files) {
            try{
                require(`./src/routers/bots/${files[i]}`)(app,url,client,nodecache,io )
                console.log(`Router (Bots) ${files[i]} online `)
            }catch(error) {
                console.log(`Router (Bots) error ${files[i]}: ${error}`)
            }
        }
    
    
    })
    const http = require('http');
    const server = http.createServer(app);
       server.listen(3000,()=>{
            console.log("App listening on port 3000")
        })
        const io = require('socket.io')(server);
        
        io.on('connection', (socket) => {
            socket.on('joinRoom',data=>{
                socket.join(data.token)
                console.log(data.token)
            })
            console.log(`${socket.id} connected`);

          });

    const { Permissions,Intents,MessageEmbed,Client,GatewayIntentBits,Collection,EmbedBuilder  } = require('discord.js');
    const client = new Client({ 
        intents: [Intents.FLAGS.GUILD_INTEGRATIONS,Intents.FLAGS.GUILD_PRESENCES ,Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MEMBERS,
        ]
    });
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');
    const { umask } = require('process');
    client.commands = new Collection();
    
    const commandsPath = path.join(__dirname, 'src/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = []
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try{
            const command = require(filePath);
            commands.push(command['data'].toJSON())
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command['data'].name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }catch(err) {
            if(err) return console.log(err)
        }

    }
    
    client.login(process.env.token)
    client.on(`interactionCreate`,(interaction)=>{
        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
             command.execute(interaction,io);
        } catch (error) {
            console.error(error);
             interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    })
    client.on("ready", ()=>{
        console.log(`Logged in as ${client.user.tag}!`);
        fs.readdir("./src/events/",(err,files)=>{
            if(files.length <= 0) return
            for(let i in files) {
                const event = require(`./src/events/${files[i]}`);
                try{
                    client.on(`${files[i].split(".js")[0]}`,(...args)=>{
                        event.run(...args)
                    })
                    console.log(`Event ${files[i]} online `)
                }catch(error) {
                    console.log(`Event error ${files[i]}: ${error}`)
                }
            }
        })
        fs.readdir("./src/api/",(err,files)=>{
            if(files.length <= 0) return
            for(let i in files) {
                try{
                    require(`./src/api/${files[i]}`)(app,disc_url ,redirect,nodecache,client,io)
                    console.log(`Api ${files[i]} online `)
                }catch(error) {
                    console.log(`Apierror ${files[i]}: ${error}`)
                }
             }
        })
          const rest = new REST({ version: '9' }).setToken(process.env.token);
            try{
                     rest.put(Routes.applicationCommands(process.env.CLIENT_ID),{
                        body:commands
                    }).then(response=>{
                     }).catch(err=>{
                       console.log(err)
                     })
                    console.log("deu bom!")
            }catch(err){
                if(err) return console.log(err)
            }
    
    })
    cron.schedule('0 1 * * *', () => {
        const reportEmbed = new MessageEmbed()
        var date = new Date()
        Server.find({premium:true},async (err,result)=>{
            let currentTime = new Date();
            var canBump = result.filter(server=>(new Date(server.lastBump) - currentTime) / (1000 * 60 * 60 * 24) <= -1.) 
            for(let i in canBump) {
                 await Server.updateMany({ "id": canBump[i].id },
                { $set: { "lastBump": new Date().toISOString()  } });
            }
        })
        Server.find({todayReport:'true'},async (err,result)=>{ 
            result.forEach(async server => {
                try {
                    var page_views_value 
                    var join_clicks_value 

                    var channel = await client.channels.cache.get(server.todayReportChannel)
                    if(server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]) {
                        page_views_value = server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data'] > server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate() - 1]['data'] ? `( +${ ~~((server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']/server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]['data'])*100)} % comparing with yesterday! )`:`( -${ ~~((server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']/server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]['data'])*100)} % comparing with yesterday! )`

                    }
                    if(server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]) {
                        join_clicks_value = server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data'] > server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate() - 1]['data'] ? ` ( +${ ~~((server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']/server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]['data'])*100)} % comparing with yesterday! )`:`( -${ ~~(( server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']/server.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][`${date.getDate() - 1}`]['data'])*100)} % comparing with yesterday! )`

                    }
                    reportEmbed
                    .setTitle(`Today's ${server.name} report`)
                    .setColor(5763719	)
                    .setThumbnail(`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`)
                    .setDescription(` \n
                    📥 **Joined Users: ${server.impressions.joins.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']}**\n
                    👀 **Page Views: ${server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']} ** 
                    ***${page_views_value}***\n
                    🔗 **Join Clicks: ${server.impressions.pageViews.get(`${date.getUTCFullYear()}`)[moment().format("MMMM")][date.getDate()]['data']}** 
                    ***${join_clicks_value}***
                    \n **[See every information in a graph](https://discolounge.net/dashboard/${server.id}/graph)**
                    \n ***[Try Premium  to get more members !](https://discolounge.net/premium)***\n
                    `)
                    .setFooter({ text: 'New Report will be sent here again in 24 hours!'})
                    channel.send({ embeds: [reportEmbed] })
                    console.log(`today's report sent!`)

                }catch(err) {
                    if(err) return console.log(err)
                }
            });
        })
      });
    
    
    
    
    
    
    