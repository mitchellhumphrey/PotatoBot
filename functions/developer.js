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

module.exports = {

    developer_check: function (msg) {
        return config.developers.includes(msg.author.id.toString());
    },

    bot_status_sensitive: async function (msg, client, db, queue) {

        newEmbed = new Discord.MessageEmbed().setTitle("Bot Status");
        in_these_servers = "\n";
        length = 0;
        await client.guilds.cache.map(function (x) {
            let numOfSongs = 0;
            db.prepare(`SELECT * FROM '${x.id}_music'`).all().forEach(z => {
                //console.log(x.name)
                numOfSongs++;
            });
            in_these_servers += (x.toString() + "\n");
            in_these_servers += ("     member count    : " + x.memberCount + "\n");
            in_these_servers += ("     joined date     : " + timestamp.toDate(x.joinedTimestamp / 1000).toString().substr(0, 24) + "\n");
            in_these_servers += ("     Number of Songs : " + (numOfSongs) + "\n");
        });
        newEmbed.addField("**IN THESE SERVERS**", '```' + in_these_servers + "```");
        newEmbed.addField("Uptime", msToTime(client.uptime), false);



        msg.channel.send(newEmbed);
    },

    bot_status: (msg, client, db) => {
        newEmbed = new Discord.MessageEmbed().setTitle("Bot Status");
        var memberCount = 0;
        var numOfServers = 0;
        var numOfSongs = 0;
        client.guilds.cache.map((x) => {
            memberCount += x.memberCount;
            numOfServers++;
            db.prepare(`SELECT * FROM '${x.id}_music'`).all().forEach(z => {
                //console.log(x.name)
                numOfSongs++;
            });






        })
        newEmbed.addField("Watching Over", memberCount.toString() + " members");
        newEmbed.addField("Total Number of Server", numOfServers);
        newEmbed.addField("Total Number of Songs", numOfSongs);
        newEmbed.addField("Uptime", msToTime(client.uptime));

        msg.channel.send(newEmbed);
    },

    server_status: function (msg, client, db, queue) {
        newEmbed = new Discord.MessageEmbed().setTitle("Server Status");
    }
}