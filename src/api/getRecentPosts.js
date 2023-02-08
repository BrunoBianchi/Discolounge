const FormData = require("form-data");
const Blog = require("../modals/blog");

module.exports = function(app,disc_url,redirect) {
    app.post("/recentPosts", (req, res) => {
        Blog.find({},(err,result)=>{
          if(result.length <=0) return res.json({undefined})
            var posts = result[0].posts.sort((a,b)=>{
                return  new Date(b.createdAt) -  new Date(a.createdAt)
                }).slice(0,3)
                res.json({posts})
        })
      
      });
}