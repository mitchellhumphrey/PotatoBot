const Discord = require('discord.js');
const Database = require('better-sqlite3');
const fs = require('fs');



module.exports = {

    log: function (msg, db, command) {
        db.prepare(`INSERT INTO '${msg.guild.id}_command_log' VALUES('${command + Date.now().toString()}','${command}','${Date.now().toString()}')`).run();
    },
    writeout: async function (msg, db, client) {
        let name = `${Date.now().toString()}_log`
        Promise.all(client.guilds.cache).then(guildlist => {
            fs.open(`${name}.txt`, 'a', (err, fd) => {
                if (err) throw err;//console.log(err)
                guildlist.forEach((guild) => {
                    //console.log(guild[1].id);
                    db.prepare(`SELECT * FROM '${guild[1].id}_command_log'`).all().forEach(x => {
                        //console.log(JSON.stringify(x))
                        x.guild_id = guild[1].id;
                        delete x.key;
                        fs.appendFile(`${name}.txt`, JSON.stringify(x) + '\n', { flag: "a" }, (err) => {
                            //console.log(err);
                        })
                    })
                })



            });


        }).then(() => {
            console.log("finished");
            msg.channel.send("Report", { files: [`${name}.txt`] });
            fs.unlink(`${name}.txt`, (err) => {
                console.log(err);
            });

        })
    }

}