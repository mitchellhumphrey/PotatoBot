const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });
const config = require('./config.json'); //stores login token as token property
const fs = require('fs');
const Database = require('better-sqlite3');
const prefix = config.prefix;
const async = require("async");
const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken, client);

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Think ways of making commands shorter / maybe using pipe to seperate
///args instead of spaces  --DONE
///Get custom commands working
///
///
///
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/




//my files
const start = require('./functions/on_start.js');
const help = require('./functions/help.js');
const permissions = require('./functions/permissions.js');
const test = require('./functions/test.js');
const developer = require('./functions/developer.js');
const voice = require('./functions/voice.js');
const reactions = require('./functions/reactions.js');
const join = require('./functions/join.js');
const leave = require('./functions/leave.js');
const playlist = require('./functions/playlist.js');
const search = require('./functions/search.js');
const dumb = require('./functions/dumb.js');
const guildadd = require('./functions/guildmemberadd.js');
const dblfile = require('./functions/dbl.js');
const cmdlog = require('./functions/cmdlog.js');

let db = new Database('databases/foobar.db')


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


dbl.on('posted', () => {
  console.log('Server count posted!');
  //client.fetchUser("148812749260980224");
});

client.on('ready', () => {
  start.start(db, client);
  setInterval(() => {
    dbl.postStats(client.guilds.size);
  }, 1800000);
});

client.on('message', async function (msg) {

  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  var args = msg.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();
  var strung = args.join(" ");

  newargs = []
  asyncForEach(strung.split("|"), async (x) => {
    newargs.push(x.trim().toLowerCase());
  }).then(() => {
    args = newargs;
    //const command = args.shift().toLowerCase();
    if (msg.channel.type === 'dm' && command !== 'help' && command !== 'help in channel') {
      msg.channel.send("sorry I don't work in DMs except for the help command");
      return;
    }

    //CONSOLE LOG FOR COMMAND AND IF AUTHOR HAS PERMS
    console.log(command);
    console.log(args);
    //console.log(database.check_if_valid_author(msg, db).toString() + " The Perms are");




    //HELP COMMANDS

    if (command === "help old") {
      help.help_old(msg, args);
    }
    else if (command === "help in channel old") {
      help.help_in_channel_old(msg, args);
    }
    else if (command === "help") {
      cmdlog.log(msg,db,command);
      help.help(msg, args, client);
    }
    else if (command === "cmdlog" && developer.developer_check(msg)){
      cmdlog.log(msg,db,command);
      cmdlog.writeout(msg,db,client);
    }

    //DEVELOPER COMMANDS

    else if (command === "bot-status-sensitive" && developer.developer_check(msg)) {
      cmdlog.log(msg,db,command);
      developer.bot_status_sensitive(msg, client, db, voice.get_queues(client));
    }
    else if (command === "music-status" && developer.developer_check(msg)){
      cmdlog.log(msg,db,command);
      developer.music_status(msg,client,voice.get_queues(client));
    }
    else if (command === "dbl-status"){
      //cmdlog.log(msg,db,command);
      //dblfile.top_status(msg);
    }


    //COMMANDS START HERE
    else if (command === "vote"){
      cmdlog.log(msg,db,command);
      dblfile.vote(msg);
    }
    else if (command === "support"){
      cmdlog.log(msg,db,command);
      help.support(msg);
    }

    else if (command === "stream") {
      cmdlog.log(msg,db,command);
      voice.stream(msg, args[0], client);
    }
    else if (command === "play") {
      cmdlog.log(msg,db,command);
      voice.search(msg, args[0], client);
    }
    else if (command === "bot-status") {
      cmdlog.log(msg,db,command);
      developer.bot_status(msg, client, db, voice.get_queues(client));
    }
    else if (command === "server-status") {
      cmdlog.log(msg,db,command);
      developer.server_status(msg, client, db, voice.get_queues(client));
    }
    else if (command === 'add-perms' && permissions.check_if_valid_author(msg, db)) {
      cmdlog.log(msg,db,command);
      permissions.add_user(msg, args, db);
    }
    else if (command === 'remove-perms' && permissions.check_if_valid_author(msg, db)) {
      cmdlog.log(msg,db,command);
      permissions.remove_user(msg, db);
    }
    else if (command === 'list-perms') {
      cmdlog.log(msg,db,command);
      permissions.list_perms(msg, db);
    }
    else if (command === 'add-watch' && permissions.check_if_valid_author(msg, db)) {
      cmdlog.log(msg,db,command);
      reactions.add_message_to_watch(msg, args, db);
    }
    else if (command === 'remove-watch' && permissions.check_if_valid_author(msg, db)) {
      cmdlog.log(msg,db,command);
      reactions.remove_message_from_watch(msg, args, db);
    }
    else if (command === 'list-watch') {
      cmdlog.log(msg,db,command);
      reactions.list_watch(msg, args, db, client);
    }
    else if (command === 'skip') {
      cmdlog.log(msg,db,command);
      voice.skip(msg, client, db);
    }
    else if (command === 'queue') {
      cmdlog.log(msg,db,command);
      voice.list_queue(msg, client, args);
    }
    else if (['empty-queue', 'eq'].includes(command) && permissions.check_if_valid_author(msg, db)) {
      cmdlog.log(msg,db,command);
      voice.clear_queue(msg, client,db);
    }
    else if (command === 'kill' && developer.developer_check(msg)) {
      cmdlog.log(msg,db,command);
      kill(client, msg);
    }
    else if (command === 'r') {
      cmdlog.log(msg,db,command);
      voice.rickroll(msg, client);
    }
    else if (command === "hlep") {
      cmdlog.log(msg,db,command);
      let items = ["c:", "oop", ":/", "No Kendall", "I am boot", "beep boop"]
      msg.channel.send(items[Math.floor(Math.random() * items.length)]);
    }
    else if (['now-playing', 'np', 'nowplaying'].includes(command)) {
      cmdlog.log(msg,db,command);
      voice.now_playing(msg, client);
    }
    else if (command === 'search') {
      cmdlog.log(msg,db,command);
      search.search(msg, args[0]);
    }
    else if (command === 'meme') {
      cmdlog.log(msg,db,command);
      search.meme(msg, args[0]);
    }
    else if (command === 'owo') {
      cmdlog.log(msg,db,command);
      dumb.owo(msg, args[0], args[1]);
    }
    else if (command === 'joinrole-set') {
      cmdlog.log(msg,db,command);
      guildadd.set(args, db, msg);
    }
    else if (command === 'joinrole-remove') {
      cmdlog.log(msg,db,command);
      guildadd.remove(db, msg);
    }
    else if (command === 'joinrole-list') {
      cmdlog.log(msg,db,command);
      guildadd.list(msg, db, client);
    }





    //custom command parsing
    else {
      permissions.custom(msg, command, db);
    }
  })
});

client.on('messageReactionAdd', async (reaction, user) => {
  reactions.messageReactionAdd(reaction, user, db);
})

client.on('messageReactionRemove', async (reaction, user) => {
  reactions.messageReactionRemove(reaction, user, db);
})

client.on('guildCreate', async (guild) => {
  join.onJoin(guild, db);
})

client.on('guildDelete', async (guild) => {
  leave.onLeave(guild, db);
})

client.on('guildMemberAdd', async (member) => {
  guildadd.onAdd(member, client, db);
})

function kill(client, msg) {
  msg.channel.send(new Discord.MessageEmbed().setTitle("Terminating Bot")).then(() => {
    msg.delete().then(() => {
      client.destroy();
      process.exit();
    })


  })

}

client.login(config.token);