const Discord = require('discord.js');
const config = require("../config.json");

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Update help function on voice and playlist commands
///Create custom help commands for each file / section of command
///
///
///
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/

const helpEmbed = new Discord.MessageEmbed().setTitle("How To Use Bot: Prefix "+config.prefix);
helpEmbed.addField("**help**","Lists non custom commands",true);
helpEmbed.addField("**help-in-channel**","Lists non custom commands in channel message is recieved",true);
helpEmbed.addField("**bot-status**","Lists uptime and amount of servers bot is in",true);
//helpEmbed.addField("**add**","broken till updated to use SQL",true);
helpEmbed.addField("**args-test**","shows how arguments will be detected my command parser",true);
//helpEmbed.addField("**list-custom-commands**","Lists all custom commands for guild (BROKEN)",true);
helpEmbed.addField("**join-vc**","Joins your current VC",true);
helpEmbed.addField("**leave-vc**","Leaves your current VC",true);
helpEmbed.addField("**play**","plays a custom uploaded song",true);
helpEmbed.addField("**add-song**","adds a custom song, 1st argument is the title of the song MUST BE 1 WORD",true);
helpEmbed.addField("**remove-song**","remove a custom song from the database",true);
helpEmbed.addField("**list-song**","Lists all uploaded songs to this server",true);
helpEmbed.addField("**add-perms**","Takes all users mentioned in this message and gives them perms",true);
helpEmbed.addField("**remove-perms**","Takes all users mentioned in this message and removes them from perms",true);
helpEmbed.addField("**list-perms**","Lists all users with perms",true);
helpEmbed.addField("**add-to-watch**","argument 1: message id \nargument 2: role to give person who reacts to message",true);
helpEmbed.addField("**remove-from-watch**","removes message id from watch list",true);


module.exports = {
    help : function (msg) {
        msg.author.send(helpEmbed);
    },

    help_in_channel : function (msg) {
        msg.channel.send(helpEmbed);
    }
}