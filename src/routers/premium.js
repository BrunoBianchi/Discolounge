const Server = require("../modals/server");
var functions = require("../functions/functions")
var paypal = require('paypal-rest-sdk');
const moment = require("moment")

module.exports = function(app,url,client,nodecache) {
app.get("/premium",(req,res)=>{
    var name = req.query.name
   Server.find({},(err,result)=>{
    if(req.cookies.token&&nodecache.get(req.cookies.token)) {
        var results = []
        results = result.filter(server=>server.owner=== res.locals.user.id)
        res.render('premium',{results})
    }else {
        var results = []
        res.render('premium',{results})
    }

   })
})
app.get("/checkoutPlan",functions.ensureAuthenticated,(req,res)=>{
    var plan = req.query.plan
    var server_id = req.query.server_id
    if(!plan) return res.json ({icon:'error',content:'plan not choosed!'})
    if(!server_id) return res.json ({icon:'error',content:'Server not choosed!'})
    var create_payment_json = ''
paypal.configure({
    'mode': 'live', //sandbox or live
    'client_id':process.env.client_id_paypal,
    'client_secret': process.env.client_secret_paypal
  });
switch(plan){
    case "mo":
        create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://localhost:3000/success?plan=mo&amount=2&server_id=${server_id}&date=1`,
                "cancel_url": "/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Monthly Plan",
                        "sku": "item",
                        "price": "2.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "2.00"
                },
                "description": "1 month premium subscription."
            }]
        };
    break
    case "6mo":
        create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://localhost:3000/success?plan=6mo&amount=10&server_id=${server_id}&date=6`,
                "cancel_url": "/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "6 Months Plan",
                        "sku": "item",
                        "price": "10.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "10.00"
                },
                "description": "6 months premium subscription."
            }]
        };
    break;
    case"yr":
    create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://localhost:3000/success?plan=yr&amount=20&server_id=${server_id}&date=12`,
            "cancel_url": "/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Annual Plan",
                    "sku": "item",
                    "price": "20.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "20.00"
            },
            "description": "1 year premium subscription."
        }]
    };
    break;
}
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error)
                return res.json ({icon:'error',content:`error: ${error}`})
            } else {
                for(let i =0;i<payment.links.length;i++) {
                    if(payment.links[i].rel === 'approval_url') {
                       res.redirect(payment.links[i].href)
                    }
                }                
            }
        });


})

app.get('/success',(req,res)=>{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    var execute_payment_json = {
        'payer_id':payerId,
        'transactions':[{
            'amount':{
                'currency':'USD',
                'total':`${req.query.amount}.00`
            }
        }]
    }
    Server.findOne({id:req.query.server_id},(err,result)=>{
        if(!result) res.redirect("/premium?error=ServerNotFound")
        else {
            paypal.payment.execute(paymentId,execute_payment_json,async function (error, payment) {
                if(error) return res.json({icon:'error',content:`error:${error}`})
                else {
                    if(!result.payments) {
                        result.payments = [{}]
                        var payments = {
                            paymentId : payment.id,
                            plan: req.query.plan,
                            amount: `${req.query.amount}.00`,
                            date:new Date(),
                        }
                        result.payments.push(payments)
                        result.premium = true
                        result.premiumExpireDate =  moment().add(req.query.date, 'months').format("MM-DD-YYYY")

                        result.save()
                    }else {
                        var payments = {
                            paymentId : payment.id,
                            plan: req.query.plan,
                            amount: `${req.query.amount}.00`,
                            date:new Date(),
                        }
                        result.payments.push(payments)
                        result.premium = true
                        if(result.premiumExpireDate) {
                            result.premiumExpireDate =  moment(result.premiumExpireDate).add(req.query.date, 'months').format("MM-DD-YYYY")

                        }else {
                            result.premiumExpireDate =  moment().add(req.query.date, 'months').format("MM-DD-YYYY")

                        }
                        result.save()
                    }
                    try{
                        var guild =  await client.guilds.cache.get('1042848358701736036')
                        var role = await guild.roles.cache.get('1049156952757911673');
                        var user =  guild.members.cache.get(res.locals.user.id)
                        user.roles.add(role);
                    }catch(err){
                        console.log(err)
                    }
                    return res.redirect(`/dashboard/${req.query.server_id}?status=success&msg=planActivated&plan=${req.query.plan}&date=${result.premiumExpireDate}`)
        
                }
            })
        }
    })

})
}