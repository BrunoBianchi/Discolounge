const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Bots = require("../modals/bots");

const moment = require("moment")
const { request } = require('undici');

const bumpEmbed = new MessageEmbed()
.setTitle('Discolounge: The best discord listining')
.setURL('https://discolounge.net/')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('deny')
		.setDescription('Deny bot')
        .addStringOption(option =>
            option.setName("id")
                .setDescription("Bot's id")
                .setRequired(true))
                .addStringOption(option2 =>
                    option2.setName("reason")
                        .setDescription("Reason ")
                        .setRequired(true)),
	async execute(interaction) {
        var DenyReport = new MessageEmbed()
        var channel =  interaction.guild.channels.cache.get('1070157848270614610')

        if(interaction.guildId != '1042848358701736036') return await interaction.reply(`This command can be only used by staff!`);
        const bot_id = interaction.options.getString('id');
        const reason = interaction.options.getString('reason')
        if(!interaction.member.roles.cache.find(role=>role.id === '1069717896508489789')) return await interaction.reply(`This command can be only used by staff!`);
		Bots.findOne({id:bot_id},async (err,result)=>{

			
            if(result === null)  return await interaction.reply(`Bot not found, add it now [here](https://www.discolounge.net/bots/add/)`);
			if(interaction.user.bot === true ) return await interaction.reply(`This command can't be used by bots ! ❌`)
            var bot = interaction.guild.members.cache.get(result.id)
            if(result.verify === true)  return await interaction.reply(`You can't deny a verified bot !`)
            if(result.denied + 1 < 3) {
                var deniedTimes = result.denied + 1
                DenyReport
                .setTitle(`${bot.user.username} Denied ${deniedTimes}/3 😭`)
                .setURL(`https://discolounge.net/bots/${bot.user.id}`)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`)
               .setColor(10038562)
               .setDescription(`<@${result.createdBy.id}>\n __**Bot denied, reason:**__ \n\n **${reason}**  \n\n Type  ** /reverify ** once the bot is fixed!`)
                result.denied =  result.denied + 1
                result.status = 'denied'
                result.save()
                channel.send({ embeds: [DenyReport] })
                
                return await interaction.reply(`Bot ${bot.user.username} denied!`)
            }else {
                Bots.findOne({id:bot_id}).remove().exec(async function(err, data) { 
                    if(err) return await interaction.reply(err.toString())
                    DenyReport
                    .setTitle(`${bot.user.username} Denied 3/3 😭`)
                    .setThumbnail(`https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`)
                    .setColor(10038562)
                    .setDescription(` <@${result.createdBy.id}> \n __**Bot denied, reason:**__\n \n **${reason}** \n\n  Since your bot has been denied 3 times, it will be removed from our list. But you can add again after fixed! `)
                    channel.send({ embeds: [DenyReport] })
                     return await interaction.reply(`Bot ${bot.user.username} denied!`)
                    })
            }




                    
		})
	},
};