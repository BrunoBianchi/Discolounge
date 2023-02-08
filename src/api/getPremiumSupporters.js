const FormData = require("form-data");

module.exports = function(app,disc_url,redirect,nodecache,client) {
    app.post("/premiumSupporters", async (req, res) => {
       var guild = await client.guilds.cache.get('1042848358701736036')
       var users = await guild.members.cache.filter(m=>m.roles.cache.get('1049156952757911673'))
       var sort_users = users.map(value => ({ value, sort: Math.random() }))
       .sort((a, b) => a.sort - b.sort)
       .map(({ value }) => value).slice(0,18)
       res.json({users:sort_users,usersLength:users.size})
    });
}