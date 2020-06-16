const Discord = require('discord.js');
const Database = require('better-sqlite3');
const config = require('../config.json');

function is_in_database_as_discord_id(db,guild_id, id){
    return Boolean( db.prepare(`SELECT discord_id FROM '${guild_id}_perms' WHERE discord_id='${id}';`).get())
}

module.exports = {
    add : function (msg, args, db) {
            
    },

    custom : function (msg, command, db){
        
    },

    listall : function (msg,db){
        
    },

    remove : function(msg, args, db){
        
        
    },

    check_if_valid_author : function (msg, db){
        if(is_in_database_as_discord_id(db,msg.guild.id,msg.author.id)){return true}
        if(msg.author===msg.guild.owner) {return true}
        if(config.developers.includes(msg.author.id.toString())) {return true}
        return false;
    },

    add_user : function (msg, args, db) {

        if(args.length === 0){
            msg.channel.send(new Discord.MessageEmbed().setTitle("Did Not Mention Anybody"));
            return;
        }

        var addedEmbed = new Discord.MessageEmbed().setTitle("Added");
        //msg.channel.send(addedEmbed);
        var bool = false;
        var flag = false;
        
        msg.mentions.users.forEach(x=>{
            console.log("CHECKING IF USER IS IN DATABASE")
            if(x.id === msg.guild.ownerID) {
                console.log("IS SERVER OWNER"); 
                msg.channel.send(new Discord.MessageEmbed().setTitle("Tried to Give Server Owner Perms"));
                //msg.delete();
                flag = true;

            }
            else if (x.bot){
                console.log("IS A BOT");
                msg.channel.send(new Discord.MessageEmbed().setTitle("Tried to Give Bot Perms"));
                //msg.delete();
                flag=true;
            }
            else if(config.developers.includes(x.id.toString())) {
                console.log("IS A BOT DEVELOPER"); 
                msg.channel.send(new Discord.MessageEmbed().setTitle("Tried to Give Bot Developer Perms"));
                //msg.delete();
                flag=true;
            }
            //x.id
            else if(!is_in_database_as_discord_id(db,msg.guild.id,x.id)){
                console.log("USER NOT IN DATABASE")
                db.prepare(`INSERT INTO '${msg.guild.id}_perms' VALUES('${x.id}',1)`).run();
                addedEmbed.addField("ADDED USER",x.toString());
                bool = true
            }
            else {console.log("USER IN DATABASE ALREADY")}
        })
        
        
        if(bool) {
            msg.channel.send(addedEmbed);
            //msg.delete();
        }
        else if(!flag) {
            msg.channel.send(new Discord.MessageEmbed().setTitle("No New Users to Give Perms"))
            //msg.delete();
        }

    },

    remove_user : function (msg, db) {
        var addedEmbed = new Discord.MessageEmbed().setTitle("Removed");
        var bool = false;
        msg.mentions.users.forEach(x=>{
            //x.id
            console.log("CHECKING IF USER IS IN DATABASE")
            if(is_in_database_as_discord_id(db,msg.guild.id,x.id)){
                console.log("USER IN DATABASE")
                db.prepare(`DELETE FROM '${msg.guild.id}_perms' WHERE discord_id='${x.id}';`).run();
                addedEmbed.addField("REMOVED",x.toString())
                bool = true;
            }
            else {console.log("USER NOT IN DATABASE")}
        })
        if(bool) msg.channel.send(addedEmbed)
        else msg.channel.send(new Discord.MessageEmbed().setTitle("No Users to Remove"))
        
    },



    list_perms : function (msg, db){
        var addedEmbed = new Discord.MessageEmbed().setTitle("Users with Perms");
        addedEmbed.addField("Server Owner", msg.guild.owner.toString());
        var textOfPerms = '';
        var has_perms = []
        db.prepare(`SELECT * FROM '${msg.guild.id}_perms'`).all().forEach(x=>{
            has_perms.push(x.discord_id.toString());
        });
        console.log(has_perms)
        msg.guild.members.cache.filter(m=>has_perms.includes(m.user.id.toString())).forEach(x=>{
            //console.log(x);
            textOfPerms+=(x.toString()+'\n');
            
        })
        if(textOfPerms.length !== 0){
            addedEmbed.addField("Has Perms", textOfPerms);
        }
        
        config.developers.forEach(x=>{
            addedEmbed.addField("Bot Developer", "<@"+x+">")
        })
        //addedEmbed.addField("Bot Developer", "<@148812749260980224>")
        msg.channel.send(addedEmbed);
    }

    
}



//THIS COMMENTED OUT LINE FINDS THE GUILD MEMBER OBJECT BASED ON ID
//var mem_array = msg.guild.members.cache.filter(m=>array_user_ids.includes(m.id.toString()));
//mem_array.forEach(x=>{
//    addedEmbed.addField("Has Perms", x.toString(),true);