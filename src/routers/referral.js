var functions = require("../functions/functions")
const users = require('../modals/users')

module.exports = function(app,url,client,nodechace) {
app.get("/r/:id",(req,res)=>{
    if(!req.params.id) return res.redirect('/')
    else res.redirect(`/login?uri=dashboard;referralCode=${req.params.id}`)
})
app.get("/:lang/referrals",functions.languages,functions.ensureAuthenticated,(req,res)=>{
    var user = nodechace.get(req.cookies.token)
    users.find({userID:user.id},(err,result)=>{
        if(result) return  res.render("./referrals",{data:result})
        else res.redirect('/login?uri=referral')
    })
})
}