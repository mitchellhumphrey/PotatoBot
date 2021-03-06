const Discord = require('discord.js');
const Database = require('better-sqlite3');

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///
///
///
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/

module.exports = {
    onJoin: function (guild, db) {
        //pass
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_perms';`).get()) {
            db.prepare(`CREATE TABLE '${guild.id}_perms' (discord_id TEXT PRIMARY KEY, perm_level INTEGER NOT NULL)`).run();
            console.log("ADDED PERMS TABLE FOR GUILD ID " + guild.id)
        }
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_custom_commands';`).get()) {
            db.prepare(`CREATE TABLE '${guild.id}_custom_commands' (command TEXT PRIMARY KEY, output TEXT NOT NULL)`).run();
            console.log("ADDED CUSTOM COMMANDS TABLE FOR GUILD ID " + guild.id)
        }
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_music';`).get()) {
            db.prepare(`CREATE TABLE '${guild.id}_music' (name TEXT PRIMARY KEY, path TEXT NOT NULL)`).run();
            console.log("ADDED MUSIC TABLE FOR GUILD ID " + guild.id)
        }
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_reaction_roles';`).get()) {
            db.prepare(`CREATE TABLE '${guild.id}_reaction_roles' (message_id_to_watch TEXT PRIMARY KEY, role_given TEXT NOT NULL)`).run();
            console.log("ADDED REACTION ROLES TABLE FOR GUILD ID " + guild.id)
        }
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_playlist';`).get()) {
            db.prepare(`CREATE TABLE '${guild.id}_playlist' (playlist_name TEXT PRIMARY KEY, JSON_as_string TEXT NOT NULL)`).run();
            console.log("ADDED PLAYLIST TABLE FOR GUILD ID " + guild.id)
        }
        if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name= '${guild.id}_command_log';`).get()){
            db.prepare(`CREATE TABLE '${guild.id}_command_log' (key TEXT PRIMARY KEY,command TEXT NOT NULL, date TEXT NOT NULL)`).run();
            console.log("ADDED COMMAND LOG TABLE");
        }

        guild.owner.user.createDM().then((DMChannel)=>{DMChannel.send(
            new Discord.MessageEmbed().setTitle("Thanks for the Invite!").setDescription(`If you need any help with configuration, use $help or Join our support server  [Click Here](https://discord.com/invite/FbKsmNk)
            this server will also be how you are notified when there will be a bot outage (normally for matenince / upgrades)
            `)

        )})


    }
}