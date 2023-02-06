const Server = require("../modals/server");
module.exports = function(app) {
app.get("/tos",(req,res)=>{
      res.render(`TOS`)
})
app.get("/pp",(req,res)=>{
      res.render(`pp`)
})
}