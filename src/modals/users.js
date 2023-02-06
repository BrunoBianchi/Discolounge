const { Schema } = require("mongoose");
const mongoose = require("../database/database");
const shortid = require("shortid");
var htmlencode = require('htmlencode');
 const moment = require("moment")
const users_ban_schema = new Schema({
        userID:{
            type:String,
            require: true,
        },
        ban:[{
            banID:{
                type:String,
                require: true,
            },
            banDate: {
              type: Date,
            },
            reason:{
                type:String,
            }
        }],
        referrals:{
            type:Number,
            default:0,
        },
        referralCode:{
            type:String
        },
        referral:{
            type:String,
        },
        coins:{
            type:Number,
            default:0,
        }
});

const users_ban = mongoose.model("users_ban",users_ban_schema);
module.exports = users_ban;