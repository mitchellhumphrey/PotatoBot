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
//\nOptional Arguments are `[]`
const title = "How To Use Bot: Prefix `"+config.prefix+"` Seperate Arguments With `|`\nRequired Arguments `<>` Optional Arguments `[]`"

const helpEmbed = new Discord.MessageEmbed().setTitle("General Help");
helpEmbed.setDescription(title)


helpEmbed.addField("**"+config.prefix+"help**","gives help information");
helpEmbed.addField("**"+config.prefix+"bot-status**", "gives bot status");
helpEmbed.addField("**"+config.prefix+"server-status**", "gives status of server");
//helpEmbed.addField("**"+config.prefix+"kill**","terminates bot");
helpEmbed.addField("**"+config.prefix+"hlep**","sends a funny message");
helpEmbed.addField(`**${config.prefix}search <term>**`,"searches Wikipedia for an article and gives the summary and link");
helpEmbed.addField(`**${config.prefix}meme <term>**`,"searches Knowyourmeme for an article and gives the summary and link");
helpEmbed.addField(`**${config.prefix}owo <term> | [strength]**`,"owoifies your phrase, strength can be 0-2 for how much owoing you want")




const defaultHelp = new Discord.MessageEmbed().setTitle('Help');
defaultHelp.setDescription(`How To Use Bot: Prefix \`${config.prefix}\`\n Support Server:  [Click Here](https://discord.com/invite/FbKsmNk) \n Vote for this bot: [Click Here](https://top.gg/bot/636778046900273153/vote)`);
defaultHelp.addField("**Music Help**",config.prefix+"help music", true);
defaultHelp.addField("**General Help**",config.prefix+"help general", true);
defaultHelp.addField("**Reaction Role Help**",config.prefix+"help reaction",true);
defaultHelp.addField("**Server Configuration**",config.prefix+"help configure", true);


const musicHelp = new Discord.MessageEmbed().setTitle("Music");
musicHelp.setDescription(title);
//musicHelp.addField("**"+config.prefix+"stream <url>**", "plays a song without adding to the bot library");
musicHelp.addField("**"+config.prefix+"play <query>**","streams first video from YouTube that matches the query");
musicHelp.addField("**"+config.prefix+"queue**","lists all songs in queue");
musicHelp.addField("**"+config.prefix+"skip**","skips current song to next in queue, if queue is empty, bot will leave VC (Must have perms or Added the Song)");
musicHelp.addField("**"+config.prefix+"empty-queue**","removes all songs from queue and leaves VC (Must have perms)");



const playlistHelp = new Discord.MessageEmbed().setTitle("Playlist")
playlistHelp.setDescription(title);
playlistHelp.addField("**"+config.prefix+"list all playlists**","lists all playlists for this server");
playlistHelp.addField("**"+config.prefix+"list playlist content | <playlist name>**","lists all songs in a playlist");
playlistHelp.addField("**"+config.prefix+"delete playlist | <playlist name>**","deletes a playlist");
playlistHelp.addField("**"+config.prefix+"play playlist | <playlist name>**","plays a playlist randomly");
playlistHelp.addField("**"+config.prefix+"play playlist order | <playlist name>**","plays a playlist in order");
playlistHelp.addField("**"+config.prefix+"make playlist | <playlist name> | <song 1> | [song 2] | ...**","makes a playlist with all songs provided as arguments, will ignore songs that arent in library");
playlistHelp.addField("**"+config.prefix+"add to playlist | <playlist name> | <song name 1> | [song name 2]**","adds x songs to a playlist, must add at least 1");



const reactionEmbed = new Discord.MessageEmbed().setTitle("Reaction Roles")
reactionEmbed.setDescription(title+"\n **Must have perms to use all commands listed**");
reactionEmbed.addField("**"+config.prefix+"add-watch <message ID> | <mention role to give>**","Adds message to database, will give role if that message is reacted to")
reactionEmbed.addField("**"+config.prefix+"remove-watch <message ID>**","removes message from database")
reactionEmbed.addField("**"+config.prefix+"list-watch**","will show all messages currently being watched for roles")
// reactionEmbed.addField("**"+config.prefix+"**","")


const configureEmbed = new Discord.MessageEmbed().setTitle("Server Configuration")
configureEmbed.setDescription("How To Use Bot: Prefix `"+config.prefix+"`   Required Arguments `<>`")
configureEmbed.addField(`**${config.prefix}joinrole-set <Role ID>**`,"gives every member who joins the guild the role that corresponds to the Role ID");
configureEmbed.addField(`**${config.prefix}joinrole-remove**`,"removes the joinrole role");
configureEmbed.addField(`**${config.prefix}joinrole-list**`,"displays the current role that is given to all members who join the guild");


module.exports = {
    help : function (msg,args,client) {
        help_logic(msg,args,client);
        //msg.delete();
    },

    help_in_channel : function (msg,args) {
        help_logic(msg,args);
        //msg.delete();
    },
    support : function (msg){
        const embed = new Discord.MessageEmbed().setTitle("Get Support").setDescription("Join this Discord Server to Recieve Support: [Click Here](https://discord.com/invite/FbKsmNk)");
        msg.channel.send(embed);
    }
}

function help_logic(msg,args,client){
    if(args[0]==="general"){
        msg.channel.send(helpEmbed.setThumbnail(client.user.avatarURL()));
    }
    else if (args[0]==="music"){
        msg.channel.send(musicHelp.setThumbnail(client.user.avatarURL()));
    }
    else if (args[0]==='playlist'){
        //msg.channel.send(playlistHelp);
    }
    else if (args[0]==='reaction'){
        msg.channel.send(reactionEmbed.setThumbnail(client.user.avatarURL()));
    }
    else if (args[0]==="configure"){
        msg.channel.send(configureEmbed.setThumbnail(client.user.avatarURL()));
    }
    else msg.channel.send(defaultHelp.setThumbnail(client.user.avatarURL()))
}

