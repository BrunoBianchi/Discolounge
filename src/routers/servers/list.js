const Server = require(`${__dirname.split('src')[0]}/src/modals/server`);
module.exports = function(app) {
app.get("/list",(req,res)=>{
    var page = Math.abs((req.query.page - 1)*9 )  
    var next_page = page + 9
    var filter = req.query.filter
   Server.find({},(err,result)=>{
    var results = []
    if(next_page > result.length) next_page = result.length
    if(filter) {
        results = result.slice(page,next_page).sort((a,b)=>{return  (b.premium - a.premium) && (b[filter] - a[filter]) || (b[filter] - a[filter]) ||  (b.partner - a.partner)})
    }else  {
        results = result.slice(page,next_page)
    }
    if(!req.query.page) return res.redirect("/list?page=1")
    res.render("./servers/list.ejs",{data:results})
   })
})
app.get("/getMoreList",(req,res)=>{
    var page = Math.abs((req.query.page - 1)*9)  
    var next_page = page + 9

    var filter = req.query.filter
   Server.find({},(err,result)=>{
    if(next_page > result.length) next_page = result.length
    var results = []
    if(filter) {
        results = result.slice(page,next_page).sort((a,b)=>{return  (b.premium - a.premium) && (b[filter] - a[filter]) || (b[filter] - a[filter]) ||  (b.partner - a.partner)})
    }else  {
        results = result.slice(page,next_page)
    }
    return res.json({data:results})
   })
})
app.get("/searchName",(req,res)=>{

    var name = req.query.name
   Server.find({},(err,result)=>{
           var results = []
    results = result.filter(server=>server.name.includes(name)).sort(() => Math.random() - 0.5).slice(0,8)
    return res.json({data:results})
   })
})
}