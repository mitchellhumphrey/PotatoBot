const Discord = require('discord.js');


module.exports = {
    'args_test' : function (msg, args) {
        msg.channel.send(args);
    }
}