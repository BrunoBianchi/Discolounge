var functions = require("../functions/functions")
const Server = require("../modals/server");
const users = require('../modals/users')
const moment = require("moment")
var hash = require("randomstring");
const multer = require('multer');
const path = require('path')
var fs = require('fs');
const { resourceLimits } = require("worker_threads");

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,  path.join(__dirname, '../public/backgrounds/'))
    },
    filename: function (req, file, cb) {
        var ext = ['png','jpg','gif','jpeg']
        // Extração da extensão do arquivo original:
        const extensaoArquivo = file.originalname.split('.')[1];
       if(!ext.includes(extensaoArquivo)) return cb(new Error('Only images are allowed'))
       var id = req.params.id
       if(!id) return cb(new Error('Server if missing!'))
        Server.findOne({id:id},(err,result)=>{
            if(!result)return cb(new Error('Not valid server'))
            if(result.premium === false)return cb(new Error('Server not premium!'))
            if(result.background != '' && fs.existsSync( path.join(__dirname, `${result.background}`))) {
                fs.unlinkSync( path.join(__dirname, `${result.background}`));
            }
            result.background = `../backgrounds/${id}.${extensaoArquivo}`
            result.save()
        })

        // Indica o novo nome do arquivo:
        cb(null, `${id}.${extensaoArquivo}`)
    }
});

const upload = multer({ storage })
module.exports = function(app,url,client,nodechace) {
    app.get("/dashboard",functions.ensureAuthenticated,(req,res)=>{
        

        res.render("./dashboard/about",{data:undefined})

    })
    app.get("/dashboard/server/:id",functions.ensureAuthenticated,  (req,res)=>{
       
        var id = req.params.id
         Server.findOne({id:req.params.id}, (err,result)=>{
            if(err) return
            if(result === null|| !client.guilds.cache.get(id)) {
                return res.redirect(
                    `https://discordapp.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=applications.commands%20bot&permissions=3089&response_type=code&redirect_uri=https://discolounge.net/dashboard/callback/config&guild_id=${id}`
                  );
            }  else {
                if(req.query.callback) return res.redirect(`/${req.query.callback}`)
                var guild = client.guilds.cache.get(id)

                functions.isOwner(req.params.id,req,res).then(response=>{
                  if(response === '401') return res.redirect('/dashboard')
                  var tags = []
                  result.tags.forEach(tag=>{
                      tags.push(tag.name)
                  })

                    res.render("./dashboard/about",{data:result,tags:tags,guild:guild})
                })
              }



        })
    })
    app.get("/dashboard/server/:id/posts",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/posts",{data:result})
            })
        })
    })
    app.get("/dashboard/server/:id/payments",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/payments",{data:result})
            })
        })
    })
    app.post("/dashboard/server/:id/bump",functions.ensureAuthenticated,(req,res)=>{
        if(!req.params.id) return res.json("no id found!")
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null) return res.json({icon:'error',content:'Server not found !'})
            let currentTime = new Date();
            let expireTime = new Date(result.lastBump);
            if( result.premium === false && (expireTime - currentTime) / (1000 * 60 * 60 ) <= -2 || result.premium === true && (expireTime - currentTime) / (1000 * 60 * 60 * 24) <= -1 ) { 
                result.lastBump = new Date().toISOString()
                result.save()
                return res.json({icon:'success',content:'You have Bumped this server!'})
            } else return res.json({icon:'error',content:"You can't bump the server right now!",LastBump:result.lastBump})
        })

    })
    app.get("/dashboard/server/:id/graph",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        var guild = client.guilds.cache.get(id)

        var currMonthName = moment().format("MMMM");

        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
                var date = new Date()
                if(!result.impressions.pageViews && ! result.impressions.joinClick && !result.impressions.joins) {
                  var chart  = {
                      pageViews: {
                           [`${date.getUTCFullYear()}`]: {
                               [`${currMonthName}`]: {
                                   [`${date.getDate()}`]:{
                                       ['data']: 0
                                   },
                               }
                           }
                       },
                       joinClicks: {
                           [`${date.getUTCFullYear()}`]: {
                               [`${currMonthName}`]: {
                                   [`${date.getDate()}`]:{
                                       ['data']: 0
                                   },
                               }
                           }
                       },
                       joins: {
                         [`${date.getUTCFullYear()}`]: {
                             [`${currMonthName}`]: {
                                 [`${date.getDate()}`]:{
                                     ['data']: 0
                                 },
                             }
                         }
                     }
                   }
                   result.impressions = chart
                }else {
                  if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)) {
                      result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                          [`${date.getUTCFullYear()}`]: {
                              [`${currMonthName}`]: {
                                  [`${date.getDate()}`]:{
                                      ['data']: 0
                                  },
                              }
                          }
                      },)
                  }
                  if(!result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)) {
                      result.impressions.joinClick.set(`${date.getUTCFullYear()}`, {
                          [`${date.getUTCFullYear()}`]: {
                              [`${currMonthName}`]: {
                                  [`${date.getDate()}`]:{
                                      ['data']: 0
                                  },
                              }
                          }
                      },)
                  }
                  if(!result.impressions.joins.get(`${date.getUTCFullYear()}`)) {
                      result.impressions.joins.set(`${date.getUTCFullYear()}`, {
                          [`${date.getUTCFullYear()}`]: {
                              [`${currMonthName}`]: {
                                  [`${date.getDate()}`]:{
                                      ['data']: 0
                                  },
                              }
                          }
                      },)
                  }
                }
                  
                  result.save()
              res.render("./dashboard/chart",{data:result,guild:guild})
            })
        })
    })
    app.get("/dashboard/server/:id/background",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
      
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            if(result.premium === false) return res.redirect('/premium')
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/background",{data:result})
            })
        })
    })
    app.post("/dashboard/server/:id/background/upload",functions.ensureAuthenticated,upload.single('foto'),  (req,res)=>{
        if(!req.file) return res.json({icon:'error',content:'could not upload this file!'})
        else res.json({icon:'success',content:'Background Uploaded!'})
    })
    app.post("/dashboard/server/:id/background/remove",functions.ensureAuthenticated,  (req,res)=>{
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                fs.unlinkSync( path.join(__dirname, `../public/backgrounds/${result.id}${result.background.split(result.id)[1]}`));

            result.background = ''
            result.save()
            return res.json({icon:'success',content:`Background removed!`})
        })
        })
    })
    app.get("/dashboard/server/:id/socials",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/socials",{data:result})
            })
        })
    })
    app.get("/dashboard/server/:id/url",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/url",{data:result})
            })
        })
    })
    app.get("/dashboard/server/:id/events",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/events",{data:result})
            })
        })
    })
    app.post("/dashboard/server/:id/socials/add",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var body = req.body
            var socials ={
                name:String,
                url:String,
            }
            for(let i in req.body) {
                if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
                socials[body[i].name] = body[i].content
            }
            result.socials.push(socials)
            result.save()
            return res.json({icon:'success',content:`Social created!`})
        })
        })

    })
    app.post("/dashboard/server/:id/socials/remove",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        var social_name = req.query.name
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var index = result.socials.findIndex(socials=>socials.name === social_name)
            if(index === undefined) return res.json({icon:'error',content:'no post found!'})
            result.socials.splice(index,1)
            result.save()
            return res.json({icon:'success',content:`social removed!`})
        })
        })

    })
    app.post("/deleteServer/:id",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        if(!id) return res.json({icon:'error',content:'no server found!'})
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                if(result.background) fs.unlinkSync( path.join(__dirname, `../public/backgrounds/${result.id}${result.background.split(result.id)[1]}`));

                Server.findOne({id:req.params.id}).remove().exec(function(err, data) {
                if(err)  return res.json({icon:'error',content:err})
                return res.json({icon:'success',content:`Server Removed`,url:"/"})
              })        
            })
        })

    })
    app.post("/dashboard/server/:id/CustomUrl",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        if(!id) return res.json({icon:'error',content:'no server found!'})
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                var exist = app. _router.stack.find(r=>  r.route!= undefined &&  r.route.path != undefined && r.route.path.includes(req.query.url) === true)
                if(exist != undefined) return res.json({icon:'error',content:"You can't set this path! "})
                Server.find({},(err,result2)=>{
                    if(result2.find(server=>server.custom_url ===req.query.url && server.id != id)) return res.json({icon:'error',content:"Url already selected by someone! "})
                     result.custom_url = req.query.url
                     result.save()
                    return res.json({icon:'success',content:`Custom url changed!`,url:"/"})
                })
            })  
        })

    })
    app.post("/dashboard/server/:id/updateInvite",functions.ensureAuthenticated,(req,res)=>{
        var channel_id= req.query.channel_id
        var id = req.params.id
        Server.findOne({id:req.params.id},(err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(async response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

                    var server =  client.guilds.cache.get(id)
                    if(server === undefined) return res.json({icon:'error',content:`server not found!`})

                    var channel = server.channels.cache.get(channel_id)
                    if(!channel) return  res.json({icon:'error',content:`channel not found!`})
                    var invite = ' '
                     try{
                     invite =  await channel.createInvite({
                     maxAge: 0,
                     maxUses: 0 
                     });
       }catch(err) {
      
       }
            result.invite = invite.url
            result.inviteChannel = invite.channel.id
            result.save()
            return res.json({icon:'success',content:`invite Created!`,invite:invite,channel:channel.name})
        })
        })

    })
    app.get("/dashboard/server/:id/api",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.redirect(`/dashboard`)
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.redirect('/dashboard')
              res.render("./dashboard/api",{data:result})
            })
        })
    })

    app.post("/dashboard/server/:id/todayReportChannel",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                result.todayReportChannel= req.query.channel
            result.save()
            return res.json({icon:'success',content:`Today's Report Channel Changed!`})
        })
        })

    })
    app.post("/dashboard/server/:id/todayReport",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                result.todayReport = req.query.value
            result.save()
            return res.json({icon:'success',content:`Today's Report Changed!`})
        })
        })

    })
    app.post("/dashboard/server/:id/WH/update",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                var body = req.body
                for(let i in req.body) {
                        result[body[i].name] = body[i].content
                }
            if(result.premium === false) result.webhook_msg = 'User {user} has voted ({user-votes} votes)'
            result.save()
            return res.json({icon:'success',content:`Weebhook Saved!`})
        })
        })

    })
    app.post("/dashboard/server/:id/api/regenerate",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
                var token = hash.generate(40)
            result.token = token
            result.save()
            return res.json({icon:'success',content:`Api token generated!`,api_token:token})
        })
        })

    })
    app.post("/dashboard/server/:id/posts/add",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var body = req.body
            var post ={
                title:String,
                content:String,
                id:hash.generate(7)
            }
            for(let i in req.body) {
                if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
                post[body[i].name] = body[i].content
            }
            result.posts.push(post)
            result.save()
            return res.json({icon:'success',content:`post  created!`})
        })
        })

    })
    app.post("/dashboard/server/:id/events/add",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var body = req.body
            var event ={
                startDate:Date,
                endDate:Date,
                title:String,
                content:String,
                participatePeople:[{
                    id:String,
                }],
                local:[{
                    id:result.id,
                    name:result.name,
                    icon:result.icon
                }],
                id:hash.generate(7)
            }
            for(let i in req.body) {
                if(body[i].required === true && body[i].content.length <= 0) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
               event[body[i].name] = body[i].content
            }
            result.events.push(event)
            result.save()
            return res.json({icon:'success',content:`event  created!`})
        })
        })

    })
    app.post("/dashboard/server/:id/events/remove",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        var event_id = req.query.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var index = result.events.findIndex(event=>event.id ===event_id)
            if(index === undefined) return res.json({icon:'error',content:'no event not found!'})
            result.events.splice(index,1)
            result.save()
            return res.json({icon:'success',content:`event removed!`})
        })
        })

    })
    app.post("/dashboard/server/:id/posts/remove",functions.ensureAuthenticated, (req,res)=>{
        var id = req.params.id
        var post_id = req.query.id
        Server.findOne({id:req.params.id}, (err,result)=>{
            
            if(result === null)  return res.json({icon:'error',content:'no server found!'})
            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})

            var index = result.posts.findIndex(post=>post.id === post_id)
            if(index === undefined) return res.json({icon:'error',content:'no post found!'})
            result.posts.splice(index,1)
            result.save()
            return res.json({icon:'success',content:`post removed!`})
        })
        })

    })
    app.get("/dashboard/callback/config",functions.ensureAuthenticated, async (req,res)=>{
        var server = client.guilds.cache.get(req.query.guild_id)

        if(server === undefined) return res.redirect("/")
       var channel = server.channels.cache.find(channel=>channel.type === "GUILD_TEXT")
       if(!channel) return res.redirect("/")
       var invite = ' '
       try{
        invite =  await channel.createInvite({
            maxAge: 0,
            maxUses: 0 
          });
          server.invite = invite.url ? invite.url : ''
          server.inviteChannel = invite.channel.id ? invite.channel.id  : ''
       }catch(err) {
      
       }
       var date = new Date();
       var currMonthName = moment().format("MMMM");

            server.votes = 0
            server.uvotes={
                users:[{
                    name:"a",
                    id:"a",
                    votes:0,
                    last_vote_date:1
                }]
            }
            server.tags=[{name:'community'}]
            server.posts = []
      var chart  = {
        pageViews: {
            [`${date.getUTCFullYear()}`]: {
                [`${currMonthName}`]: {
                    [`${date.getDate()}`]:{
                        ['data']: 0
                    },
                }
            }
        },
        joins: {
            [`${date.getUTCFullYear()}`]: {
                [`${currMonthName}`]: {
                    [`${date.getDate()}`]:{
                        ['data']: 1
                    },
                }
            }
        },
        joinClicks: {
            [`${date.getUTCFullYear()}`]: {
                [`${currMonthName}`]: {
                    [`${date.getDate()}`]:{
                        ['data']: 0
                    },
                }
            }
        }
    }
           server.todayReport = false
           server.todayReportChannel = channel.id
           server.impressions =  chart
            server.owner =  server.ownerId
            Server.findOne({id:server.id}, (err,result)=>{
                if(result!= undefined) res.redirect(`/dashboard/server/${server.id}`)
                else {
                    Server.create(server).then(result=>{
                       fs.readFile('./src/public/sitemaps.xml','utf8',(err,file)=>{
                        if(file.split(server.id)[0] != undefined) return
                        var array = file.split('</urlset>')
                        array[0] =`${array[0]} 
         <url>
        <loc>https://www.discolounge.net/server/${server.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
        <image:image>
        <image:loc>https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png</image:loc>
        </image:image>
        </url>
        </urlset>`
                        var data  = array.join('')
                        fs.writeFile('./src/public/sitemaps.xml', data, (err,file)=>{
                            if(err) return console.log(err)
                        })

                       })
                        console.log(`Criando ${server.name}`)
                        var user = nodechace.get(req.cookies.token)
                        users.findOne({referralCode: user.referral},(err,result)=>{
                            if(result &&  server.members.cache.filter(member=> !member.user.bot).size >= 1) {
                                var inviterUser  = client.guilds.cache.get('1042848358701736036').members.cache.get(result.userID)
                                if(!inviterUser) {
                                    result.coins = result.coins + 1
                                }else {
                                    var roles = ['1049454093669761114','1064648806056071190','1060586376782954576','1048364660203737089','1049156952757911673']
                                    var userRoles = inviterUser.roles.cache.filter(role=>roles.includes(role.id)).sort((a,b)=>{return (b.rawPosition - a.rawPosition)}).map(role=>{return role.id})
                                    switch(userRoles[0]) {
                                        case '1049454093669761114':
                                            result.coins = result.coins + 1
                                        break;
                                        case'1064648806056071190':
                                        result.coins = result.coins + 1.25
                                        break;
                                        case'1060586376782954576':
                                        result.coins = result.coins + 2
                                        break;
                                        case'1048364660203737089':
                                        result.coins = result.coins + 1.75
                                        break;
                                        case'1049156952757911673':
                                        result.coins = result.coins + 2.5
                                        break;
                                    }
                                }
                                result.save()
                            }
                        })
                        res.redirect(`/dashboard/server/${result.id}`)

                    }).catch(err=>{
                        if(err) return  res.redirect(`/`)
                    })
                }
            })

    })
    app.post("/dashboard/server/:id/update",functions.ensureAuthenticated,(req,res)=>{
        if(!req.params.id) return res.json("no id found!")
        Server.findOne({id:req.params.id}, (err,result)=>{
            if(result === null)  return res.json({icon:'error',content:'no server found!'})

            functions.isOwner(req.params.id,req,res).then(response=>{
                if(response === '401') return res.json({icon:'error',content:'user not allowed!'})
            var tags = []
            var body = req.body
            for(let i in req.body) {
                if(body[i].required === true && body[i].content.length <= 0 ) return res.json({icon:'error',content:`${body[i].name} is required!`,el:body[i].id})
                if(body[i].name != 'tags' && body[i].name!='custom_url') {
                    result[body[i].name] = body[i].content
                }
            }
            if(result.premium != true) result.custom_url = ''
            req.body['tags'].content.split(",").forEach(tag => {
                tags.push({name:tag})
            });
            result.short_description =  result.short_description.replace('</script>', ' ').replace('<script>',' ').replace('<%-',' ').replace("%>", ' ').replace('<%', ' ').replace('</script>', ' ').replace('<script>',' ').replace('script',' ').replace('type="text/javascript"', ' ')
            result.long_description =  result.long_description.replace('</script>', ' ').replace('<script>',' ').replace('<%-',' ').replace("%>", ' ').replace('<%', ' ').replace('</script>', ' ').replace('<script>',' ').replace('script',' ').replace('type="text/javascript"', ' ')
            result.tags = tags
            result.save()
            return res.json({icon:'success',content:'Server Updated!'})
        })
    })

    })
    }