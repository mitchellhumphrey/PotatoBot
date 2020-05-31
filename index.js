const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });
const config = require('./config.json'); //stores login token as token property
const fs = require('fs');
const Database = require('better-sqlite3');
const prefix = config.prefix;


/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Think ways of making commands shorter / maybe using pipe to seperate
///args instead of spaces
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

let db = new Database('databases/foobar.db')


client.on('ready', () => {
  start.start(db, client);
});

client.on('message', async function (msg) {

  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  const args = msg.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  if (msg.channel.type === 'dm' && command !== 'help' && command !== 'help-in-channel') {
    msg.channel.send("sorry I don't work in DMs except for the help command");
    return;
  }

  //CONSOLE LOG FOR COMMAND AND IF AUTHOR HAS PERMS
  //console.log(command);
  //console.log(database.check_if_valid_author(msg, db).toString() + " The Perms are");


  //HELP COMMANDS

  if (command === "help") {
    help.help(msg);
  }
  else if (command === "help-in-channel") {
    help.help_in_channel(msg);
  }

  //DEVELOPER COMMANDS

  else if (command === "bot-status-sensitive" && developer.developer_check(msg)) {
    developer.bot_status_sensitive(msg, client, db, voice.get_queues());
  }
  else if (command === "test-playlist") {
    playlist.test_playlist(msg, client, db);
  }


  //COMMANDS START HERE

  else if (command === "bot-status") {
    developer.bot_status(msg, client, db, voice.get_queues());
  }
  else if (command === "server-status") {
    developer.server_status(msg, client, db, voice.get_queues());
  }

  else if (command === "make-playlist") {
    playlist.make_playlist(msg, client, db, args);
  }
  else if (command === "play-playlist-order") {
    playlist.play_playlist(msg, client, db, args);
  }
  else if (command === 'play-playlist') {
    playlist.play_playlist_random(msg, client, db, args);
  }
  else if (command === "add-to-playlist"){
    playlist.add_to_playlist(msg,client,db,args);
  }

  else if (command === "add" && permissions.check_if_valid_author(msg, db)) {
    console.log("IN ADD");
    permissions.add(msg, args, db);
  }
  else if (command === 'args-test') {
    test.args_test(msg, args);
  }
  else if (command === 'list-custom-commands') {
    permissions.listall(msg, db);
  }
  else if (command === 'remove' && permissions.check_if_valid_author(msg, db)) {
    permissions.remove(msg, args, db);
  }
  else if (command === 'add-perms' && permissions.check_if_valid_author(msg, db)) {
    permissions.add_user(msg, args, db);
  }
  else if (command === 'remove-perms' && permissions.check_if_valid_author(msg, db)) {
    permissions.remove_user(msg, db);
  }
  else if (command === 'list-perms') {
    permissions.list_perms(msg, db);
  }
  else if (command === 'join-vc') {
    voice.join_vc(msg, client);
  }
  else if (command === 'leave-vc') {
    voice.leave_vc(msg, client);
  }
  else if (command === 'add-song') {
    voice.add_song(msg, client, args, db);
  }
  else if (command === 'play') {
    voice.play(msg, client, args, db);
  }
  else if (command === 'remove-song') {
    voice.remove_song(msg, client, args, db);
  }
  else if (command === 'list-song') {
    voice.list_song(msg, client, args, db);
  }
  else if (command === 'add-to-watch') {
    reactions.add_message_to_watch(msg, args, db);
  }
  else if (command === 'remove-from-watch') {
    reactions.remove_message_from_watch(msg, args, db);
  }
  else if (command === 'list-watch') {
    reactions.list_watch(msg, args, db, client);
  }
  else if (command === 'skip') {
    voice.skip(msg, client);
  }
  else if (command === 'queue') {
    voice.queue(msg, client);
  }
  //custom command parsing
  else {
    permissions.custom(msg, command, db);
  }
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

client.login(config.token);