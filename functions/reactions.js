const Discord = require('discord.js');
const Database = require('better-sqlite3');

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Get working lol xd
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

function is_in_database_as_message_watch(db, guild_id, id) {
    return Boolean(db.prepare(`SELECT message_id_to_watch FROM '${guild_id}_reaction_roles' WHERE message_id_to_watch='${id}';`).get())
}

module.exports = {
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

    add_message_to_watch: function (msg, args, db) {
        //args[0] is message ID to watch, args[1] is the role to be given
        console.log("IN add_message_to_watch")
        if (!is_in_database_as_message_watch(db, msg.guild.id, args[0])) {
            console.log("message is not in database");
            //SANITIZE SOMEHOW
            db.prepare(`INSERT INTO '${msg.guild.id}_reaction_roles' VALUES('${args[0]}','${args[1]}')`).run();

        }
    },

    remove_message_from_watch: function (msg, args, db) {
        //args[0] is message ID to remove from watch
        console.log("IN remove_message_from_watch")
        if (is_in_database_as_message_watch(db, msg.guild.id, args[0])) {
            console.log("message is in database");
            db.prepare(`DELETE FROM '${msg.guild.id}_reaction_roles' WHERE message_id_to_watch='${args[0]}';`).run();
            console.log("removed Message")
        }
    },

    list_watch: function (msg, args, db, client) {
        console.log("Listing messages to watch");
        messages_watching = "I'm Watching These Messages: \n"
        db.prepare(`SELECT * FROM '${msg.guild.id}_reaction_roles'`).all().forEach(x => {
            console.log(x.message_id_to_watch);
            messages_watching += (x.message_id_to_watch + '\n')


            /*msg.guild.channels.cache.forEach(tempChannel =>{
                console.log(tempChannel.permissionOverwrites)
                console.log("HIGHEST ROLE FOR BOT'S ID IS "+client.member.highestRole.id.toString())
                if(tempChannel.type === 'text' && tempChannel.permissionOverwrites.allow.FLAGS["VIEW_CHANNEL"]===true){
                    console.log(tempChannel.messages.cache);
                    tempChannel.messages.cache.each(message=>{
                        console.log(message.content)
                    })
                    
                    
                    
                    
                    console.log(message.content).catch(console.error)
                }
            })*/
            //x.message_id_to_watch
        });
        msg.channel.send(messages_watching)
    }
}