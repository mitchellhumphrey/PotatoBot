const Discord = require('discord.js');
const Database = require('better-sqlite3');

options = {
    "readonly" : false,
    "fileMustExist" : false,
    "timeout" : 5000,
    verbose : console.log
}


module.exports = {
    start : function (db, client) {

        console.log(`Logged in as ${client.user.tag}!`);
        client.guilds.cache.forEach(guild => {
            //guild.id;
            //perms
            //custom commands
            
            if(!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_perms';`).get()){
                db.prepare(`CREATE TABLE '${guild.id}_perms' (discord_id TEXT PRIMARY KEY, perm_level INTEGER NOT NULL)`).run();
            }
            if(!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_custom_commands';`).get()){
                db.prepare(`CREATE TABLE '${guild.id}_custom_commands' (command TEXT PRIMARY KEY, output TEXT NOT NULL)`).run();
            }
            if(!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_music';`).get()){
                db.prepare(`CREATE TABLE '${guild.id}_music' (name TEXT PRIMARY KEY, path TEXT NOT NULL)`).run();
            }
            if(!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_reaction_roles';`).get()){
                db.prepare(`CREATE TABLE '${guild.id}_reaction_roles' (message_id_to_watch TEXT PRIMARY KEY, role_given TEXT NOT NULL)`).run();
            }
                
            
            
        });
        output = db.prepare(`SELECT * FROM sqlite_master WHERE type='table'`).all()
        output.forEach(x=>{
            db.prepare(`SELECT * FROM '${x['name']}'`).all().forEach(i=>{console.log(i)})
            console.log();
        })
        console.log("loaded all servers, bot is live");
    }
}