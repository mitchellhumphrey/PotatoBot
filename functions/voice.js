const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const Database = require('better-sqlite3');
const ytdl = require('ytdl-core');
/*
TODO
 ADD SKIP FUNCTIONALITY WHEN QUEUE IS EMPTY //
 ADD EMBEDS FOR ALL SITUATIONS
 make playlists possible
 add song name to list queue


*/
server_queue = { playing_state : new Object() }


function create_server_queues(old_queue, client) {

    client.guilds.cache.forEach(x => {
        if (old_queue[x.id] === undefined) {
            old_queue[x.id] = [];
        }
        if (old_queue.playing_state === undefined) {
            old_queue.playing_state = {}
        }
        if (old_queue.playing_state[x.id] === undefined) {
            old_queue.playing_state[x.id] = false;
        }
    })
    return old_queue;
}



function is_in_database_as_song_name(db, guild_id, name) {
    return Boolean(db.prepare(`SELECT name FROM '${guild_id}_music' WHERE name='${name}';`).get())
}

function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    });
}

// FUNCTIONS THAT PLAYS MUSIC


function recursive_play(msg, queue, client, connection) {
    console.log(queue)
    console.log("IS QUEUE")

    from_queue = queue[msg.guild.id].shift()
    path = from_queue.path
    console.log("IN RECURSIVE PLAY AND PATH IS " + path)
    var stream = connection.play(path);
    stream.on("finish", async function (value) {
        console.log("IN FINISHED FOR SONG RECURSIVE_PLAY")
        if (queue[msg.guild.id].length === 0) {
            connection.disconnect();
            server_queue.playing_state[msg.guild.id] = false;
            console.log("RETURNING DUE TO QUEUE BEING EMPTY")
            return;
        }
        else {
            recursive_play(msg, queue, client, connection);
        }

    });
}

function start_play(msg, queue, client) {
    console.log("IN START PLAY")
    
    if (msg.member.voice.channel.join !== null) {
        
        msg.member.voice.channel.join().then(connection => {
            queue.playing_state[msg.guild.id] = true;
            recursive_play(msg, queue, client, connection);
        });
    }
    else {
        msg.channel.send(new Discord.MessageEmbed().setTitle("Must be in Voice Channel"))
    }
}
//--------------------------------------------------------------


module.exports = {
    join_vc: function (msg, client) {
        if (msg.member.voice)
            msg.member.voice.channel.join();
    },

    leave_vc: function (msg, client) {
        msg.member.voice.channel.leave();
        server_queue.playing_state[msg.guild.id] = false;
    },

    add_song: async function (msg, client, args, db) {

        console.log("PLAYING SONG");
        console.log(msg.attachments.size);
        if (msg.attachments.size !== 0) {
            if (msg.attachments.first().name.split(".").pop() === `mp3`) {
                console.log("IS MP3")
                if (args[0] === undefined) {
                    msg.channel.send(new Discord.MessageEmbed().setTitle("Need Name for Song"));
                    msg.delete();
                    return;
                }


                download(msg.attachments.first().url, `./music/${msg.id}.mp3`, () => {

                    db.prepare(`INSERT INTO '${msg.guild.id}_music' VALUES('${args[0]}','./music/${msg.id}.mp3')`).run();
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Added Song: " + args[0].toString()).addField("Added By:",msg.author.toString()));
                    msg.delete();
                })

            }
            else {
                msg.channel.send(new Discord.MessageEmbed().setTitle("Tried to Add File that Isn't an MP3"));
                msg.delete();
            }
        }
        else if (args[0]) {
            (new Promise(async function (res, rej) {
                if (ytdl.validateURL(args[1])) {
                    res(ytdl(args[1], { filter: 'audioonly' }).pipe(fs.createWriteStream(`./music/${msg.id}.mp3`)));
                }
                else {
                    rej(("THERE WAS AN ERROR"));
                }


            }))
                .then(() => {
                    console.log("DOWNLOADED SUCESSFULLY")
                    db.prepare(`INSERT INTO '${msg.guild.id}_music' VALUES('${args[0]}','./music/${msg.id}.mp3')`).run();
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Added Song: " + args[0].toString()).addField("Added By:",msg.author.toString()));
                    msg.delete();
                }).catch(err => {
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Unable To Add Song"));
                    msg.delete();
                    fs.unlink(`./music/${msg.id}.mp3`, err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    });
                });

        }

    },

    play_test: function (msg, client) {
        if (msg.member.voice) {
            msg.member.voice.channel.join().then(connection => {
                var stream = connection.play('./music/test.mp3');
                stream.on("speaking", value => {
                    if (!value) {
                        connection.disconnect();
                        return;
                    }
                });
            });
        }
    },

    play_test2: function (msg, client) {
        if (msg.member.voice) {
            msg.member.voice.channel.join().then(connection => {
                var stream = connection.play('./music/test.mp3');
                stream.on("finish", value => {
                    var stream = connection.play('./music/test.mp3');
                    stream.on("finish", value => {
                        connection.disconnect();
                        return;
                    })
                });
            });
        }
    },

    play: async function (msg, client, args, db) {
        server_queue = create_server_queues(server_queue, client);
        if (is_in_database_as_song_name(db, msg.guild.id, args[0])) {
            var returned_value = db.prepare(`SELECT path FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).get();
            console.log("returned_value is ")
            console.log(returned_value)
            var path = returned_value.path;
            console.log(path + " IS PATH TO NEW SONG");
            if (msg.member.voice) {
                console.log(server_queue.playing_state[msg.guild.id] + " IS PLAYING STATE")

                server_queue[msg.guild.id].push({path : path,name : args[0]});



                if (server_queue.playing_state[msg.guild.id] === false) {
                    console.log("PLAYING STATE IS FALSE")

                    console.log()

                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setTitle("Now Playing: " + args[0].toString()).addField("Added By:",msg.author.toString()));
                    msg.delete();
                    console.log("CALLING START PLAY")
                    start_play(msg, server_queue, client);
                }



                else if (server_queue.playing_state[msg.guild.id] === true) {
                    console.log("PLAYING STATE IS TRUE")

                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setTitle("Added to Queue: " + args[0].toString()).addField("Added By:",msg.author.toString()));
                    msg.delete();
                }
            }

        }

    },

    remove_song: function (msg, client, args, db) {
        if (is_in_database_as_song_name(db, msg.guild.id, args[0])) {
            var path = db.prepare(`SELECT path FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).get().path;
            db.prepare(`DELETE FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).run();
            msg.channel.send(new Discord.MessageEmbed().setColor('#FF0000').setTitle("Removed: " + args[0].toString()).addField("Added By:",msg.author.toString()));
            msg.delete();
            fs.unlink(path, err => {
                if (err) {
                    console.error(err)
                    return
                }
            });
        }
    },

    list_song: function (msg, client, args, db) {
        var addedEmbed = new Discord.MessageEmbed().setTitle("List of Songs");
        var song_names = '```\n'
        db.prepare(`SELECT * FROM '${msg.guild.id}_music'`).all().forEach(x => {
            //console.log(x.name)
            song_names += (x.name + '\n')
        });
        song_names += "```"
        addedEmbed.addField(msg.guild.name, song_names);
        msg.channel.send(addedEmbed);
        msg.delete();
    },


    skip: function (msg, client) {
        if(msg.member.voice.channel !== null){
            if (server_queue[msg.guild.id].length !== 0) {
                start_play(msg, server_queue, client);
            }
            else {
                msg.member.voice.channel.leave();
                server_queue.playing_state[msg.guild.id] = false;
            }
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Not in Voice Channel"))
            msg.delete();
        }
        

    },

    queue : (msg, client) =>{
        addedEmbed = new Discord.MessageEmbed().setTitle("Queue");
        server_queue = create_server_queues(server_queue, client);
        server_queue[msg.guild.id].forEach(x=>{
            addedEmbed.addField("Song Name",x.name);
        })
        msg.channel.send(addedEmbed);
    },

    get_queues : () =>{
        return server_queue;
    }
}