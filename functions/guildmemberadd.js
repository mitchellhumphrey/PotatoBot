const permission = require('./permissions.js')
const Discord = require('discord.js')
const config = require("../config.json");

module.exports = {
    onAdd: function (gMember, client, db) {

        if (db.prepare(`SELECT id FROM 'onJoin' WHERE id='${gMember.guild.id}'`).get()) {
            let response = db.prepare(`SELECT * FROM 'onJoin' WHERE id='${gMember.guild.id}'`).get();
            console.log(response);
            gMember.roles.add(response['roleID']);
        }
    },

    set: function (args, db, msg) {
        //args[0] is role ID
        console.log("IN SET");

        if (permission.check_if_valid_author(msg, db)) {
            try {
                if (db.prepare(`SELECT id FROM onJoin WHERE id='${msg.guild.id}'`).get()) {
                    db.prepare(`DELETE FROM onJoin WHERE id='${msg.guild.id}'`).run()
                }
                db.prepare(`INSERT INTO onJoin VALUES(${msg.guild.id},'${args[0]}')`).run();
                msg.react("✅");
            }
            catch (err) {
                console.log(err);
                msg.react("❌");
            }

        }
        else {
            msg.react("❌");
        }




    },
    remove: function (db, msg) {
        try {
            if (permission.check_if_valid_author(msg, db)) {
                if (db.prepare(`SELECT id FROM onJoin WHERE id='${msg.guild.id}'`).get()) {
                    db.prepare(`DELETE FROM onJoin WHERE id='${msg.guild.id}'`).run()
                    msg.react("✅")
                }
                else msg.react("❌");
            }
            else msg.react("❌");
        }
        catch (error) {
            console.log(error);
            msg.react("❌");
        }
    },
    list: async function (msg, db) {
        if (db.prepare(`SELECT id FROM onJoin WHERE id='${msg.guild.id}'`).get()) {
            let response = db.prepare(`SELECT * FROM 'onJoin' WHERE id='${msg.guild.id}'`).get();
            let roleID = response['roleID'];
            let role = await msg.guild.roles.fetch(roleID);
            msg.channel.send(
                new Discord.MessageEmbed().setTitle("Role Given when Joined").setDescription(role.toString()))
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("No Join Role Configured").setDescription(`Check out \`${config.prefix} help configure\` for help`))
        }
    }
}