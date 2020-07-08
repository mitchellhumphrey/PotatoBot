const Discord = require('discord.js');

module.exports = {
    vote : function(msg){
        const embed = new Discord.MessageEmbed().setTitle("Vote").setDescription("Vote for this bot: [Click Here](https://top.gg/bot/636778046900273153/vote)")


        msg.channel.send(embed)
    }



}