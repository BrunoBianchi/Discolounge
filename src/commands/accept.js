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
		.setName('accept')
		.setDescription('accept bot')
        .addStringOption(option =>
            option.setName("id")
                .setDescription("bot's id")
                .setRequired(true)),
	async execute(interaction) {
        if(interaction.guildId != '1042848358701736036') return await interaction.reply(`This command can be only used by staff!`);
        const bot_id = interaction.options.getString('id');
        if(!interaction.member.roles.cache.find(role=>role.id === '1069717896508489789')) return await interaction.reply(`This command can be only used by staff!`);
		Bots.findOne({id:bot_id},async (err,result)=>{
			if(result === null)  return await interaction.reply(`Bot not found, add it now [here](https://www.discolounge.net/bots/add/)`);
			if(interaction.user.bot === true ) return await interaction.reply(`This command can't be used by bots ! ❌`)
            var bot = interaction.guild.members.cache.get(result.id)
            console.log(bot)
            if(result.verify === true)  return await interaction.reply(`Bot already verified! ❌`)

            var verify_role =  interaction.guild.roles.cache.find(r => r.id== "1069720005878497300");
            var unverify_role =  interaction.guild.roles.cache.find(r => r.id== "1069720069963264092");
            result.verify = true
            result.verifiedAt = moment().format('MMMM Do YYYY h:mm:ss a')
            result.status = 'verified'
            result.save()
            bot.roles.add(verify_role)
            bot.roles.remove(unverify_role)
            const newBotEmbed = new MessageEmbed()
            .setTitle(`${bot.user.username} Verified 🥳`)
            .setURL(`https://discolounge.net/bot/${bot.user.id}`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`)
            .setColor(5763719)
            .setDescription(` <@${result.createdBy.id}> your Bot is now Verified `)
            var channel =  interaction.guild.channels.cache.get('1070157848270614610')
            channel.send({ embeds: [newBotEmbed] })
            return await interaction.reply(`Bot ${bot.user.username} verified!`)
		})
	},
};