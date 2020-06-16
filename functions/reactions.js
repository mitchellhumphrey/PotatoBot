const Discord = require('discord.js');
const Database = require('better-sqlite3');

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Get working lol xd
///Add option to set role on join
///Add certain emote to give for role
///
///
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/

function is_in_database_as_message_watch(db, guild_id, id) {
    return Boolean(db.prepare(`SELECT message_id_to_watch FROM '${guild_id}_reaction_roles' WHERE message_id_to_watch='${id}';`).get())
}

module.exports = {
    //pre         :
    //post        :
    //description :
    messageReactionAdd: async function (reaction, user, db) {
        if (reaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await reaction.fetch();
            } catch (error) {
                console.log('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        console.log(`${reaction.message.content} was reacted with ${reaction.emoji}`)
        if (is_in_database_as_message_watch(db, reaction.message.guild.id, reaction.message.id)) {
            var role = db.prepare(`SELECT role_given FROM '${reaction.message.guild.id}_reaction_roles' WHERE message_id_to_watch='${reaction.message.id}';`).get()
            console.log(role);

            guild_member = reaction.message.guild.member(user)
            //reaction.message.guild.roles.find('name',role)
            console.log(role.role_given.substring(3, 21))
            reaction.message.guild.roles.fetch(role.role_given.substring(3, 21)).then(x => guild_member.roles.add(x))
        }
    },
    //pre         :
    //post        :
    //description :
    messageReactionRemove: async function (reaction, user, db) {
        if (reaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await reaction.fetch();
            } catch (error) {
                console.log('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        console.log(`${reaction.message.content} was reacted with ${reaction.emoji}`)
        if (is_in_database_as_message_watch(db, reaction.message.guild.id, reaction.message.id)) {
            var role = db.prepare(`SELECT role_given FROM '${reaction.message.guild.id}_reaction_roles' WHERE message_id_to_watch='${reaction.message.id}';`).get()
            console.log(role);

            guild_member = reaction.message.guild.member(user)
            //reaction.message.guild.roles.find('name',role)
            console.log(role.role_given.substring(3, 21))
            reaction.message.guild.roles.fetch(role.role_given.substring(3, 21)).then(x => guild_member.roles.remove(x))
        }

    },
    //pre         :
    //post        :
    //description :
    add_message_to_watch: function (msg, args, db) {
        //args[0] is message ID to watch, args[1] is the role to be given
        console.log("IN add_message_to_watch")
        if (!is_in_database_as_message_watch(db, msg.guild.id, args[0])) {
            console.log("message is not in database");
            try {
                //SANITIZE SOMEHOW
                db.prepare(`INSERT INTO '${msg.guild.id}_reaction_roles' VALUES('${args[0]}','${args[1]}')`).run();
                msg.react("✅")
            }
            catch (err) {
                console.log(error);
                msg.react("❌")
            }


        }
    },
    //pre         :
    //post        :
    //description :
    remove_message_from_watch: function (msg, args, db) {
        //args[0] is message ID to remove from watch
        console.log("IN remove_message_from_watch")
        if (is_in_database_as_message_watch(db, msg.guild.id, args[0])) {
            try {
                console.log("message is in database");
                db.prepare(`DELETE FROM '${msg.guild.id}_reaction_roles' WHERE message_id_to_watch='${args[0]}';`).run();
                console.log("removed Message")
                msg.react("✅")
            }
            catch(err){
                console.log(err);
                msg.react("❌")
            }
            
        }
    },
    //pre         :
    //post        :
    //description :
    list_watch: function (msg, args, db, client) {
        console.log("Listing messages to watch");
        messages_watching = "I'm Watching These Messages: \n"
        var embed = new Discord.MessageEmbed();
        var bar = new Promise((res, rej) => {
            db.prepare(`SELECT * FROM '${msg.guild.id}_reaction_roles'`).all().forEach(x => {

                var theChannel;

                for (const [, channel] of msg.guild.channels.cache) {
                    if (channel.type === 'text') {
                        channel.messages.fetch(x.message_id_to_watch).then(async (idk) => {
                            if (idk.id === x.message_id_to_watch) {

                                channel.messages.fetch(x.message_id_to_watch)
                                    .then(watched => {
                                        //messages_watching += (`[${idk.content}](${watched.url}) Role: ${x.role_given} ID: ${x.message_id_to_watch}\n\n\n`);
                                        embed.addField("Message Info:", `[${idk.content}](${watched.url})\nRole: ${x.role_given}\nID: ${x.message_id_to_watch}`)
                                        console.log(messages_watching);
                                        res();
                                    })
                            }
                        }).catch((err) => { /*console.log(err)*/ })
                    }
                }
            })
        }).then(() => {
            console.log("Should be sending")
            embed.setTitle("Watching").setDescription(messages_watching);
            msg.channel.send(embed)
        }).catch(err => {
            console.log(err);
        })
    }
}