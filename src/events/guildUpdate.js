const Server = require("../modals/server");

module.exports.run = async (guildOld,guildNew) => {
    if(guildOld.icon != guildNew.icon) {
        await Server.updateOne({id:guildNew.id}, { icon: guildNew.icon });
    }
    if(guildOld.name != guildNew.name) {
        await Server.updateOne({id:guildNew.id}, { name: guildNew.name});
    }
return
}