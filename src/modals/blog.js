const { Schema } = require("mongoose");
const mongoose = require("../database/database");
const shortid = require("shortid");
var htmlencode = require('htmlencode');
 const moment = require("moment")
const BlogSchema = new Schema({
    posts:[{
        content:{
          type:String,
          default:' '
        },
        title:{
          type:String,
          default:' '
        },
        id:{
          type:String,
        },
        createdAt: {
          type: Date,
          default:Date.now,
          require: true,
        },
        createdBy: {
            type: Date,
            default:Date.now,
            require: true,
          },
    }],
});

const blog = mongoose.model("blog",BlogSchema);
module.exports = blog;