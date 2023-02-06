const { Schema } = require("mongoose");
const mongoose = require("../database/database");
const shortid = require("shortid");
var htmlencode = require('htmlencode');
 const moment = require("moment")
const MarketSchema = new Schema({
    items:[{
        image:{
          default:' ',
          type:String,
        },
        content:{
          type:String,
          default:' '
        },
        title:{
          type:String,
        },
        id:{
          type:String,
        },
        value:{
            type:Number,
        },
        keys:[{
        }],
    }],
});

const  market = mongoose.model("market", MarketSchema);
module.exports = market;