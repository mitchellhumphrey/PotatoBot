const Discord = require('discord.js');

module.exports = {
    vote : function(msg){
        const embed = new Discord.MessageEmbed().setTitle("Vote").setDescription("Vote for this bot: [Click Here](https://top.gg/bot/636778046900273153/vote)")


        msg.channel.send(embed)
    },
    top_status : function (msg){
        msg.channel.send(new Discord.MessageEmbed().setTitle("top.gg Status").setImage(url="https://top.gg/api/widget/636778046900273153.svg"));
    }



}