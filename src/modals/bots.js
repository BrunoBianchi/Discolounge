const { Schema } = require("mongoose");
const mongoose = require("../database/database");
const shortid = require("shortid");
var htmlencode = require('htmlencode');
 const moment = require("moment")
const BotsSchema = new Schema({

        name:{
          type:String,
        },
        id:{
          type:String,
        },
        short_description:{
            default:'I Love Dccommunity, check out my cool bot!',
          type:String,
        },
        long_description: {
            type:String,
            default:'I Love Dccommunity, check out my cool bot!'
        },
        votes:{
            total:{
                default:0,
                type:Number
            },
            users:[{
                id:{
                    type:String
                },
                name:{
                    type:String
                },
                total:{
                    type:Number,
                    default:0
                },
                last_vote_date:{
                  type: String,
                }
            }]
        },
       verify:{
            type:Boolean,
            default:false
        },
        status:{
          type:String,
          default:'unverified'
        },
        denied:{
          type:Number,
          default:0
        },
        reviews:{
            averageStars:{
              type:Number,
              default:0
            },
            rates:[{
              user:{
                id:{
                  type:String,
                },
                icon:{
                  type:String
                },
                name:{
                  type:String
                }
              },
              comment:{
                type:String,
                default:''
              },
              stars:{
                type:Number,
              },
              createdAt:{
                type: Date,
                default:Date.now,
              },
              likes:{
                type:Number,
                default:0
              },
              deslikes:{
                type:Number,
                default:0
              },
            }],
          },
          socials:[{
            icon:{
              type:String,
              default:'',
            },
            name:{
              type:String,
              default:'',
            },
            url:{
              type:String,
              default:''
            }
          }],
          tags:[{
            name:{
              type:String,
              require:true,
            }
          }],
          premium: {
            type: Boolean,
            default: false,
            require: true,
          },
          partner:{
            type: Boolean,
            default: false,
            require: true,
          },
          premiumExpireDate:{
            type: String,
            require:true,
            default:''
          },
          token:{
            type:String,
            require:true,
          },
          serversCount:{
            type:Number,
            default:1
          },
          icon:{
            type:String,
            require:true,
          },
        createdBy:{
            name:{
                type:String
            },
            id:{
                type:Number
            },
            avatar:{
              type:String
            }

        },
        verifiedAt:{
          type: String,
          require: true,
        },
        createdAt: {
            type: Date,
            default:Date.now,
            require: true,
          },
          NSFW:{
            type:Boolean,
            default:false,
            require:true,
          },
          invite:{
            type:String
          }
});

const bots = mongoose.model("bots",BotsSchema);
module.exports = bots;