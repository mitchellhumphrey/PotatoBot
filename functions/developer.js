const Discord = require('discord.js');
const config = require('../config.json'); // has user id as strings in developers property as array
const Database = require('better-sqlite3');
const timestamp = require('unix-timestamp');

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///server status
///
///
///
///
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/



//pre         :
//post        :
//description :
function msToTime(s) {

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}
//pre         :
//post        :
//description :
function chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index + chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}




module.exports = {
    //pre         :
    //post        :
    //description :
    developer_check: function (msg) {
        return config.developers.includes(msg.author.id.toString());
    },
    //pre         :
    //post        :
    //description :

    oldestAccount: function (msg) {
        msg.guild.members.fetch().then((x)=>{
            x.each(user => console.log(user.id))
            .filter(user => user.bot)
            //.filter(user => user.user.createdAt < new Date("March 31, 2016"))
            .each(user =>{console.log("BOTS");console.log(user.id)});
        
        
        
        
        })
            
    },

    bot_status_sensitive: async function (msg, client, db, queue) {

        newEmbed = new Discord.MessageEmbed().setTitle("Bot Status");
        in_these_servers = "\n";
        length = 0;
        message_array = []
        await client.guilds.cache.map(function (x) {
            let numOfSongs = 0;
            db.prepare(`SELECT * FROM '${x.id}_music'`).all().forEach(z => {
                //console.log(x.name)
                numOfSongs++;
            });
            in_these_servers += (x.toString() + "\n");
            in_these_servers += ("     member count    : " + x.memberCount + "\n");
            in_these_servers += ("     joined date     : " + timestamp.toDate(x.joinedTimestamp / 1000).toString().substr(0, 24) + "\n");
            //in_these_servers += ("     Number of Songs : " + (numOfSongs) + "\n");
            if (in_these_servers.length > 1500){
                msg.channel.send(in_these_servers);
                in_these_servers = "\n";
            }
        });
        if (in_these_servers.length <= 1500){
            msg.channel.send(in_these_servers);
            in_these_servers = "\n";
        }
        //message_array.push(in_these_servers);
        newEmbed.addField("**IN THESE SERVERS**", '```' + in_these_servers + "```");
        newEmbed.addField("Uptime", msToTime(client.uptime), false);


        //for(text in message_array){
        //  msg.channel.send(text);
        //}
        
    },
    //pre         :
    //post        :
    //description :
    bot_status: (msg, client, db) => {
        newEmbed = new Discord.MessageEmbed().setTitle("Bot Status");
        var memberCount = 0;
        var numOfServers = 0;
        var numOfNonBots = 0;
        client.guilds.cache.map((x) => {
            if(x.id.toString()!=="264445053596991498"){
                memberCount += x.memberCount;
                numOfServers++;
                numOfNonBots += x.members.cache.filter(member => !member.user.bot).size;
            }
            
        })
        newEmbed.addField("Watching Over", memberCount.toString() + " members + bots");
        newEmbed.addField("Online Users",numOfNonBots)
        newEmbed.addField("Total Number of Servers", numOfServers);
        newEmbed.addField("Uptime", msToTime(client.uptime));
        newEmbed.setThumbnail(client.user.avatarURL());

        msg.channel.send(newEmbed);
    },
    
    //pre         :
    //post        :
    //description :
    server_status: function (msg, client, db, queue) {
        if (msg.guild.available) {

            VCchannelAmount = 0;
            TextchannelAmount = 0;
            ChannelDivider = 0;
            OtherChannels = 0;

            msg.guild.channels.cache.array().forEach(x => {
                switch (x.type) {
                    case "text":
                        TextchannelAmount++; break;
                    case "voice":
                        VCchannelAmount++; break;
                    case "category":
                        ChannelDivider++; break;
                    default:
                        OtherChannels++;
                }
            });


            createdAt = msg.guild.createdAt;
            description = msg.guild.description;
            emojiArray = msg.guild.emojis.cache.array();
            joinedAt = msg.guild.joinedAt;
            memberCount = msg.guild.memberCount;
            name = msg.guild.name;
            owner = msg.guild.owner;
            partnered = msg.guild.partnered;
            roleNum = msg.guild.roles.cache.array().length;

            newEmbed = new Discord.MessageEmbed().setTitle("Server Status: " + name);
            newEmbed.setThumbnail(msg.guild.iconURL());

            newEmbed.addField("Server was Created", createdAt, false);
            newEmbed.addField("Joined At", joinedAt, false);
            if (description !== null) {
                newEmbed.addField("Server Description", description, false);
            }
            //setting up emotes display
            index = 0
            chunkArray(emojiArray, 28).forEach(arr => {
                index++;
                emojistring = "\n"
                arr.forEach(x => {
                    emojistring += (" " + x.toString());
                })
                newEmbed.addField("Emotes #" + index, emojistring, false);
            })
            newEmbed.addField("Emote Count", emojiArray.length, true);
            //

            newEmbed.addField("Member Count", memberCount, true);
            newEmbed.addField("Server Owner", owner.toString(), true);
            newEmbed.addField("Number of Roles", roleNum, true);
            newEmbed.addField("Text Channels", TextchannelAmount, true);
            newEmbed.addField("Voice Channels", VCchannelAmount, true);
            newEmbed.addField("Categories", ChannelDivider, true);
            newEmbed.addField("Other Channels", OtherChannels, true);
            newEmbed.addField("Is Partnered", Boolean(partnered), true);


            msg.channel.send(newEmbed);


        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Servers Seem to be down sorry"))
        }

    }
}