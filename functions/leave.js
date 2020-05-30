const Discord = require('discord.js');
const Database = require('better-sqlite3');

module.exports = {
    onLeave : function (guild, db) {
        //pass
        if(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_perms';`).get()){
            db.prepare(`DROP TABLE '${guild.id}_perms'`).run();
            console.log("REMOVED PERMS TABLE FOR GUILD ID "+guild.id)
        }
        if(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_custom_commands';`).get()){
            db.prepare(`DROP TABLE '${guild.id}_custom_commands'`).run();
            console.log("REMOVED CUSTOM COMMANDS TABLE FOR GUILD ID "+guild.id)
        }
        if(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_music';`).get()){
            db.prepare(`DROP TABLE '${guild.id}_music'`).run();
            console.log("REMOVED MUSIC TABLE FOR GUILD ID "+guild.id)
        }
        if(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${guild.id}_reaction_roles';`).get()){
            db.prepare(`DROP TABLE '${guild.id}_reaction_roles'`).run();
            console.log("REMOVED REACTION ROLES TABLE FOR GUILD ID "+guild.id)
        }

    }
}