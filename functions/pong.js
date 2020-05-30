const Discord = require('discord.js');


module.exports = {
    pong : function (msg) {
        const pongEmbed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('PONG')
            .addFields(
            {name: 'content 1' , value: "content 1", inline:true},
            {name: 'content 2' , value: "content 2",inline:true},
            {name: 'content 3' , value: "content 3", inline: true},
            {name: 'content 4' , value: "content 4",inline:true},
            {name: 'content 5' , value: "content 5",inline:true}
            )
            .setFooter('Demo Footer goes here');
        msg.channel.send(pongEmbed); 
    }
}
