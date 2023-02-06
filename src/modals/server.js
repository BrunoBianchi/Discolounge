const { Schema } = require("mongoose");
const mongoose = require("../database/database");
const shortid = require("shortid");
var htmlencode = require('htmlencode');
 const moment = require("moment")
const ServerSchema = new Schema({
  token:{
    type:String,
    require:true,
  },
  owner:{
    type:String,
    require:true,
  },
  background:{
    type:String,
    default:''
  },
  name: {
    type: String,
    require: true,
    lowercase: true,
  },
  custom_url:{
    type:String,
    default:'',
  },
  webhook:{
    type:String,
    default:''
  },
  webhook_msg:{
    type:String,
    default:'User {user} has voted ({user-votes} votes)'
  },
  icon:{
    type:String,
    require:true,
  },
  lang:{
    type:String,
    default:'en'
  },
  id: {
    type: String,
    unique: true,
    require: true,
  },
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
  tags:[{
    name:{
      type:String,
      require:true,
    }
  }],
  memberCount:{
    type:Number,
    default:0,
  },
  socials:[{
    name:{
      type:String,
      default:'',
    },
    url:{
      type:String,
      default:''
    }
  }],
  votes:{
    type:Number,
    default:0,
  },
  todayReport:{
    default:'false',
    type:String
  },
  todayReportChannel:{
    type:String
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
    
  }],
  events:[{
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
    startDate: {
      type: Date,
      require: true,
    },
    endDate:{
      type: Date,
      require: true,
    },
  participatePeople:[{
    id:{
      type:String,
    }
  }],
  createdAt: {
    type: Date,
    default:Date.now,
    require: true,
  },
  local:[{
    id:{
      type:String
    },
    icon:{
      type:String
    },
    name:{
      type:String,
    }
  }]
}],
  payments:[{
    paymentId:{
      type:String
    },
    plan:{
      type:String
    },
    amount:{
      type:String
    },
    date:{
      type: Date
    }
  }],
  short_description:{
    type: String,
    require:true,
    default:'I love Discolounge',
  },
  long_description:{
    type: String ,
    require:true,
    default:'I love Discolounge'
  },
  chart:  { 
    type : Map , 
    default : {}
  },
  impressions:  { 
    joins:{
      type:Map,
      default : {}
    },
    pageViews:{
      type:Map,
      default : {}
    },
    joinClicks:{
      type:Map,
      default : {}
    }
  },
  uvotes:{
    users:[{
      type:Object,
      name:{
        type:String,
      },
      id:{
        type:String,
      },
      votes:{
        type:Number,
        default:0,
      },
      last_vote_date:{
        type: Date,
      }
    }]
  },
  NSFW:{
    type:Boolean,
    default:false,
    require:true,
  },
  createdAt: {
    type: Date,
    default:Date.now,
    require: true,
  },
  lastBump: {
    type: Date,
    require: true,
    default:Date.now,
  },
  preferredLocale: {
    type:String,
    require:true,
  },
  invite: {
    type:String,
    require:true,
  },
  inviteChannel:{
    type:String,
    require:true
  }
});

const server = mongoose.model("servers", ServerSchema);
module.exports = server;