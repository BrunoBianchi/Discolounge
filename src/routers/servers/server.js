const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
var moment = require("moment");
var functions = require(`${__dirname.split('src')[0]}/src/functions/functions`);

module.exports= function(app,url,client,nodecache) {

    app.get("/:lang/server/:id",functions.languages,async (req,res)=>{
        var id = req.params.id
        if(isNaN(id)) {
            Server.findOne({custom_url:id},async (err,result)=>{  
                if(!result) return res.redirect('/')
                var  id = result.id
                var guild = await client.guilds.fetch(id )
                if(!guild )  {guild = []; guild.offline = true}
                if(!id) return res.redirect("/")
                    if(!result) return res.json("No server Found!")
                    guild.name = result.name
                    guild.id = result.id
                    guild.short_description = result.short_description
                    guild.long_description= result.long_description
                    guild.joinedAt = result.content
                    guild.NSFW = result.NSFW
                    guild.votes = result.votes
                    guild.tags = result.tags
                    guild.socials = result.socials
                    guild.lastBump = result.lastBump
                    guild.custom_url = result.custom_url
                    guild.averageColor = result.averageColor
                    guild.reviews = result.reviews
                    guild.premium = result.premium
                    guild.background = result.background
                    guild.posts = result.posts
                    var date = new Date()
                    var currMonthName = moment().format("MMMM");
                    if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)) {
                        var chart  = {
                            pageViews: {
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
                        result.impressions =  chart
                    }else {
                        if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName]) {
                            result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                                ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                                [`${currMonthName}`]: {
                                  [date.getDate()]: {
                                    ['data']:1
                                  },
                                },
                              });
                        }else {
                            if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]){
                                result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                                    ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                                [`${currMonthName}`]: {
                                ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                                  [date.getDate()]: {
                                    ['data']:1
                                  },
                                },
                              });
                        }else {
    
                            var data =
                            result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]
                              ['data']
                             + 1;
                             result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                                ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                            [`${currMonthName}`]: {
                            ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                              [date.getDate()]: {
                                ['data']:data
                              },
                            },
                          });
                        }
                    }
                }
                    result.save()
                    res.render("./servers/server.ejs",{guild})
                
             })
        }else {
          var guild = ''
            try{
                          guild = await client.guilds.cache.get(id)

              
}catch(err){
  if(err) return console.log(err)
}
            var guild = await client.guilds.cache.get(id)
            if(!guild )  {guild = []; guild.offline = true}
            if(!id) return res.redirect("/")
            Server.findOne({id:id},(err,result)=>{
                if(!result) return res.json("No server Found!")
                guild.id = result.id
                guild.name = result.name
                guild.short_description = result.short_description
                guild.long_description= result.long_description
                guild.joinedAt = result.content
                guild.NSFW = result.NSFW
                guild.votes = result.votes
                guild.tags = result.tags
                guild.socials = result.socials
                guild.lastBump = result.lastBump
                guild.reviews = result.reviews
                guild.premium = result.premium
                guild.custom_url = result.custom_url
                guild.events = result.events
                guild.background = result.background
                guild.posts = result.posts
                var date = new Date()
                var currMonthName = moment().format("MMMM");
                if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)) {
                    var chart  = {
                        pageViews: {
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
                    result.impressions =  chart
                }else {
                    if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName]) {
                        result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                            ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                            [`${currMonthName}`]: {
                              [date.getDate()]: {
                                ['data']:1
                              },
                            },
                          });
                    }else {
                        if(!result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]){
                            result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                                ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                            [`${currMonthName}`]: {
                            ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                              [date.getDate()]: {
                                ['data']:1
                              },
                            },
                          });
                    }else {

                        var data =
                        result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]
                          ['data']
                         + 1;
                         result.impressions.pageViews.set(`${date.getUTCFullYear()}`, {
                            ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`),
                        [`${currMonthName}`]: {
                        ...result.impressions.pageViews.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                          [date.getDate()]: {
                            ['data']:data
                          },
                        },
                      });
                    }
                }
            }
                result.save()
                res.render("./servers/server.ejs",{guild})
            })
        }

    })
    app.post('/review/create/:id',functions.ensureAuthenticated,(req,res)=>{ 
        var id = req.params.id
        if(!id) return res.json({icon:'error',content:'id not defined!'})
        var user = nodecache.get(req.cookies.token)
        Server.findOne({id:id},(err,result)=>{
            if(!result) return res.json({icon:'error',content:'server not found!'})
            if(result.reviews.rates.find(u=>u.user.id === user.id )) return res.json({icon:'error',content:'User already reviewed this server !'})
                result.reviews.rates.push({
                    user:{
                        id:user.id,
                        icon:user.avatar,
                        name:user.username
                    },
                    stars:req.body.rate,
                    comment:req.body.comment
                })
            result.reviews.averageStars =  Number(result.reviews.averageStars + Number(req.body.rate))
            result.save()
            return res.json({icon:'success',content:'User Reviewed this server!'})
        })
    })
    app.get("/server/:id/join",(req,res)=>{
        var id = req.params.id
        if(!id) return res.redirect("/")
        var date = new Date()
        var currMonthName = moment().format("MMMM");
        Server.findOne({id:id},(err,result)=>{
                if(!result) return res.redirect('/')
                if(!result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)) {
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
                                        ['data']: 1
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
                    result.impressions =  chart
                }else {
                    if(!result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[currMonthName]) {
                        result.impressions.joinClicks.set(`${date.getUTCFullYear()}`, {
                            ...result.impressions.joinClicks.get(`${date.getUTCFullYear()}`),
                            [`${currMonthName}`]: {
                              [date.getDate()]: {
                                ['data']:1
                              },
                            },
                          });
                    }else {
                        if(!result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]){
                            result.impressions.joinClicks.set(`${date.getUTCFullYear()}`, {
                                ...result.impressions.joinClicks.get(`${date.getUTCFullYear()}`),
                            [`${currMonthName}`]: {
                            ...result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                              [date.getDate()]: {
                                ['data']:1
                              },
                            },
                          });
                    }else {

                        var data =
                        result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]
                          ['data']
                         + 1;
                         result.impressions.joinClicks.set(`${date.getUTCFullYear()}`, {
                            ...result.impressions.joinClicks.get(`${date.getUTCFullYear()}`),
                        [`${currMonthName}`]: {
                        ...result.impressions.joinClicks.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                          [date.getDate()]: {
                            ['data']:data
                          },
                        },
                      });
                    }
                }
            }
                result.save()
            res.redirect(result.invite)
        })
    })
}