const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
var MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();
module.exports= function(app,url,client) {
    app.post("/:guild/post/:id",(req,res)=>{
        var id = req.params.id
        var guild_id =req.params.guild
        if(!guild_id) return res.json("No server Found!")
        if(!id) return res.redirect("/")
        Server.findOne({id:guild_id},(err,result)=>{
            if(!result) return res.json({icon:'error',content:'server not found!'})
            var post = result.posts.find(post=>post.id === id)
            if(!post) return res.json({icon:'error',content:'post not found!'})
            post.content = `${md.render(post.content)}`
            res.json({icon:'success',content:post})
        })
    })
}