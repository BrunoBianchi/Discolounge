const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Server = require("../modals/server");
const moment = require("moment")
const { request } = require('undici');

const bumpEmbed = new MessageEmbed()
.setTitle('Discolounge: The best discord server listining')
.setURL('https://discolounge.net/')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('bump')
		.setDescription('bump your server'),
	async execute(interaction,io) {

		Server.find({id:interaction.guildId},async (err,result)=>{
			if(result.length <= 0)  return await interaction.reply(`**This Server is not in our list ❌**, add it [here](https://www.discolounge.net/dashboard/${interaction.guildId})`);
			result = result[0]
			if(result === null) return await interaction.reply(`This Server is not in our list, add it [here](https://www.discolounge.net/dashboard/${interaction.guildId})`);
			if(interaction.user.bot === true ) return await interaction.reply(`This command can't be used by bots ! ❌`)
			let currentTime = new Date();
            let expireTime = new Date(result.lastBump);
            if( result.premium === false && (expireTime - currentTime) / (1000 * 60 * 60 ) <= -2 || result.premium === true && (expireTime - currentTime) / (1000 * 60 * 60 * 24) <= -1 ) { 
                result.lastBump = new Date().toISOString()
                result.save()
				if(result.premium === true) {
					bumpEmbed 
					.setColor(5763719	)
					.setDescription(`**Server bumped 👍**  \n Check it on [Discolounge](https://discolounge.net/server/${interaction.guildId}) \n `)
					.setFooter({ text: 'You can bump again in 1 hour!'});
				}else {
					bumpEmbed 
					.setColor(5763719	)
					.setDescription(`**Server bumped 👍**  \n Check it on [Discolounge](https://discolounge.net/server/${interaction.guildId}) \n  ** Try [Premium](https://discolounge.net/premium) **`)
					.setFooter({ text: 'You can bump again in 2 hours!'});
				}
				var data={
					user:interaction.author
				}
				io.sockets.in(result.token).emit('bump',{data:user})

				return await interaction.reply({embeds:[bumpEmbed], type: 4,ephemeral: false}).catch(err=>{return})
            } else {
				if(result.premium === true) {
				bumpEmbed 
				.setColor(15548997	)
				.setDescription(`**Server Already Bumped !**   \n Use this command again in **${moment(result.lastBump).add(1, 'Minutes').diff(moment(currentTime),'hours') } Minutes** \n`)
			} else {
				bumpEmbed 
				.setColor(15548997	)
				.setDescription(`**Server Already Bumped !**   \n Use this command again in **${moment(result.lastBump).add(2, 'hours').diff(moment(currentTime),'hours') } Hours** \n  ** Try [Premium](https://discolounge.net/premium) **`)
			}
			return await interaction.reply({embeds:[bumpEmbed],ephemeral: true, type: 4,}).catch(err=>{return})

		}
		})
	},
};