const Blog = require("../modals/blog");
var functions = require("../functions/functions")
var hash = require("randomstring");
const { Body } = require("node-fetch");

module.exports = function(app) {
app.get("/blog",(req,res)=>{
  Blog.find({},(err,result)=>{
      res.render(`./blog/blog`,{data:result})
   })
})
app.get("/blog/post/:id",(req,res)=>{
    var id = req.params.id
    Blog.find({},(err,result)=>{
      var post = result[0].posts.find(post=>post.id === id)
      if(!post) return res.send('Not a valid post!')
        res.render(`./blog/blog-post`,{data:post})
     })
  })
  app.get("/blog/admin",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{
    Blog.find({},(err,result)=>{
      if(result.length<=0) {
         var  posts = [{
            title:String,
            content:String,
            createdAt:Date,
            createdBy:String
         }]
          Blog.create( posts).then(()=>{ 
            res.render(`./admin/blog-admin`,{data:result})

         })
      }else {
         res.render(`./admin/blog-admin`,{data:result})

      }
     })
  })
  app.post("/blog/admin/post",functions.ensureAuthenticated,functions.isAdmin,(req,res)=>{

      Blog.findOne({}, (err,result)=>{

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
}