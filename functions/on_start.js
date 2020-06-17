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


options = {
    "readonly": false,
    "fileMustExist": false,
    "timeout": 5000,
    verbose: console.log
}


module.exports = {
    start: function (db, client) {

        console.log(`Logged in as ${client.user.tag}!`);
        client.guilds.cache.forEach(guild => {
            //guild.id;
            //perms
            //custom commands
            client.user.setPresence({ activity: { name: 'Use $help' }, status: 'online' })


            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_perms';`).get()) {
                db.prepare(`CREATE TABLE '${guild.id}_perms' (discord_id TEXT PRIMARY KEY, perm_level INTEGER NOT NULL)`).run();
            }
            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_custom_commands';`).get()) {
                db.prepare(`CREATE TABLE '${guild.id}_custom_commands' (command TEXT PRIMARY KEY, output TEXT NOT NULL)`).run();
            }
            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_music';`).get()) {
                db.prepare(`CREATE TABLE '${guild.id}_music' (name TEXT PRIMARY KEY, path TEXT NOT NULL)`).run();
            }
            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_reaction_roles';`).get()) {
                db.prepare(`CREATE TABLE '${guild.id}_reaction_roles' (message_id_to_watch TEXT PRIMARY KEY, role_given TEXT NOT NULL)`).run();
            }
            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_playlist';`).get()) {
                db.prepare(`CREATE TABLE '${guild.id}_playlist' (playlist_name TEXT PRIMARY KEY, JSON_as_string TEXT NOT NULL)`).run();
                console.log("ADDED PLAYLIST TABLE FOR GUILD ID " + guild.id)
            }
            if (!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = 'onJoin';`).get()) {
                db.prepare(`CREATE TABLE 'onJoin' (id TEXT PRIMARY KEY, roleID TEXT NOT NULL)`).run();
                console.log("Made onJoin table");
            }



        });
        output = db.prepare(`SELECT * FROM sqlite_master WHERE type='table'`).all()
        output.forEach(x => {
            db.prepare(`SELECT * FROM '${x['name']}'`).all().forEach(i => { console.log(i) })
            //console.log();
        })
        console.log("loaded all servers, bot is live");
    }
}