const Server = require("../modals/server");

module.exports = function(app) {
    app.get('/api/login/servers',(req,res)=>{
        var token = req.headers.token
        if(!token)  return res.status(400).json({
            status: "fail",
            message: "Please,provide a valid token in headers!"
          })
          Server.findOne({token:token},(err,result)=>{
            if(!result) return res.status(400).json({
                status: "fail",
                message: "Server not found!"
              })
              else {
                return res.status(200).json({
                    status: "success",
                    cotent: result
                  })
              }

          })
    })

}