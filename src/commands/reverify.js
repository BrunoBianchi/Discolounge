const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Bots = require("../modals/bots");
const moment = require("moment")
const { request } = require('undici');

const bumpEmbed = new MessageEmbed()
.setTitle('Discolounge: The best discord listining')
.setURL('https://discolounge.net/bots')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reverify')
        .addStringOption(option =>
            option.setName("id")
                .setDescription("bot's id")
                .setRequired(true))
		.setDescription('re-verify your bot'),
	async execute(interaction) {
        var id = interaction.options.getString('id')
		Bots.findOne({id:id},async (err,result)=>{
			if(result === null) return await interaction.reply(`Bot not in our guild!`);
			if(interaction.user.bot === true ) return await interaction.reply(`This command can't be used by bots ! ❌`)
            if(result.status != 'denied') return await interaction.reply(`This command can only be used by bots with status denied`)
            result.status = 'unverified'
            result.save()
            return await interaction.reply(`You put your bot in verification again! Soon your team will review it!`)
		})
	},
};