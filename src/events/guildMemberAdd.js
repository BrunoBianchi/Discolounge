const Server = require("../modals/server");
const moment = require("moment");
const users_ban = require("../modals/users");

module.exports.run = async (member) => {
  if (member.guild.id === "1042848358701736036") {

    try {
      if(member.user.bot) {
        var unverified_role = member.guild.roles.cache.get("1069720069963264092");

        member.roles.add(unverified_role);
      }
      var member_role = member.guild.roles.cache.get("1049454093669761114");
      member.roles.add(member_role);
      users_ban.find({ userID: member.id }, (err, result) => {
        if (result.users) {
          var ban_role = member.guild.roles.cache.get("1052367327972303020");
          member.roles.add(ban_role);
        }
      });
    } catch (err) {}
    Server.find({}, async (err, result) => {
      if (
        result.filter(
          (server) => server.premium === true && server.owner === member.id
        ).length >= 1
      ) {
        try {
          var premium_role = member.guild.roles.cache.get(
            "1049156952757911673"
          );
          member.roles.add(premium_role);
        } catch (err) {}
      }
    });
  }

  var date = new Date();
  Server.findOne({ id: member.guild.id }, async (err, result) => {
    if (!result) return;
    result.memberCount = member.guild.memberCount;
    var currMonthName = moment().format("MMMM");
    if (!result) return;
    if(!result.impressions.joins.get(`${date.getUTCFullYear()}`)) {
      var chart  = {
          pageViews: {
              [`${date.getUTCFullYear()}`]: {
                  [`${currMonthName}`]: {
                      [`${date.getDate()}`]:{
                          ['data']: 0
                      },
                  }
              }
          },
          joins: {
              [`${date.getUTCFullYear()}`]: {
                  [`${currMonthName}`]: {
                      [`${date.getDate()}`]:{
                          ['data']: 1
                      },
                  }
              }
          },
          joinClicks: {
              [`${date.getUTCFullYear()}`]: {
                  [`${currMonthName}`]: {
                      [`${date.getDate()}`]:{
                          ['data']: 0
                      },
                  }
              }
          }
      }
      result.impressions =  chart
  }else {
      if(!result.impressions.joins.get(`${date.getUTCFullYear()}`)[currMonthName]) {
          result.impressions.joins.set(`${date.getUTCFullYear()}`, {
              ...result.impressions.joins.get(`${date.getUTCFullYear()}`),
              [`${currMonthName}`]: {
                [date.getDate()]: {
                  ['data']:1
                },
              },
            });
      }else {
          if(!result.impressions.joins.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]){
              result.impressions.joins.set(`${date.getUTCFullYear()}`, {
                  ...result.impressions.joins.get(`${date.getUTCFullYear()}`),
              [`${currMonthName}`]: {
              ...result.impressions.joins.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
                [date.getDate()]: {
                  ['data']:1
                },
              },
            });
      }else {

          var data =
          result.impressions.joins.get(`${date.getUTCFullYear()}`)[currMonthName][date.getDate()]
            ['data']
           + 1;
           result.impressions.joins.set(`${date.getUTCFullYear()}`, {
              ...result.impressions.joins.get(`${date.getUTCFullYear()}`),
          [`${currMonthName}`]: {
          ...result.impressions.joins.get(`${date.getUTCFullYear()}`)[`${currMonthName}`],
            [date.getDate()]: {
              ['data']:data
            },
          },
        });
      }
  }
}
    result.save();
  });
};
