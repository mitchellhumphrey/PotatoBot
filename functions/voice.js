const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const Database = require('better-sqlite3');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const permissions = require('./permissions.js');

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Add Embeds for all situations
///Update help file
///cant do commands if defened
///
///
///
///
///ADD SKIP FUNCTIONALITY WHEN QUEUE IS EMPTY // done but making make more clean later?
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/
server_queue = { playing_state: new Object(), now_playing: new Object() }

function skip (msg, client, db) {

    if (msg.member.voice.channel !== null) {
        let added = false;
        if (server_queue.now_playing[msg.guild.id].hasOwnProperty('added_by')) {
            if (server_queue.now_playing[msg.guild.id].added_by === msg.author.toString()) {
                added = true;
            }
        }

        if (permissions.check_if_valid_author(msg, db) || added) {
            if (server_queue[msg.guild.id].length !== 0) {
                start_play(msg, server_queue, client);
            }
            else {
                msg.member.voice.channel.leave();
                server_queue.playing_state[msg.guild.id] = false;
            }
            msg.react("✅")
        }
        else msg.react("❌")
        

    }
    else {
        msg.channel.send(new Discord.MessageEmbed().setTitle("Not in Voice Channel"))
        //msg.delete();
    };
}


//pre         :
//post        :
//description :
function create_server_queues(old_queue, client) {

    client.guilds.cache.forEach(x => {
        if (old_queue[x.id] === undefined) {
            old_queue[x.id] = [];
        }
        if (old_queue.playing_state === undefined) {
            old_queue.playing_state = {};
        }
        if (old_queue.playing_state[x.id] === undefined) {
            old_queue.playing_state[x.id] = false;
        }
        if (old_queue.now_playing[x.id] === undefined) {
            old_queue.now_playing[x.id] = new Object();
        }
    })
    return old_queue;
}


//pre         :
//post        :
//description :
function is_in_database_as_song_name(db, guild_id, name) {
    return Boolean(db.prepare(`SELECT name FROM '${guild_id}_music' WHERE name='${name}';`).get())
}


//pre         :
//post        :
//description :
//SEE WHAT HAPPENS WHEN CONNECTION LOST AND FINISH ISNT CALLED
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

//pre         :
//post        :
//description :
function recursive_play(msg, queue, client, connection) {
    console.log(queue)
    console.log("IS QUEUE")

    from_queue = queue[msg.guild.id].shift()
    path = from_queue.path
    queue.now_playing[msg.guild.id] = from_queue.metadata;
    console.log("IN RECURSIVE PLAY AND PATH IS " + path)
    var stream = connection.play(path, { volume: 0.1 });
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

//pre         :
//post        :
//description :
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

function stream(msg, songlink, client) {
    server_queue = create_server_queues(server_queue, client);
    if (msg.member.voice) {
        console.log(server_queue.playing_state[msg.guild.id] + " IS PLAYING STATE")

        ytdl.getInfo(songlink, (err, info) => {
            console.log("ERROR: " + err);

            if (err === null) {
                img_link = info['player_response']['videoDetails']['thumbnail']['thumbnails'][1].url;
                minutes = Math.floor(Number(info['player_response']['videoDetails']['lengthSeconds']) / 60)
                seconds = Number(info['player_response']['videoDetails']['lengthSeconds']) - minutes * 60
                length_seconds = info['player_response']['videoDetails']['lengthSeconds'];
                author = info['player_response']['videoDetails']["author"];
                server_queue[msg.guild.id].push({
                    path: ytdl(songlink, { quality: 'lowest' }), name: info['title'], metadata: {
                        title: info['title'],
                        img_url: img_link,
                        length: length_seconds,
                        author: author,
                        seconds: seconds,
                        minutes: minutes,
                        song_link: songlink,
                        added_by: msg.author.toString()
                    }
                });
                //console.log(Object.keys());
                console.log(info['player_response']['videoDetails']['thumbnail']);



                if (server_queue.playing_state[msg.guild.id] === false) {
                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setImage(img_link)
                        .setTitle("Now Playing: " + info['title'].toString())
                        .addField("Added By:", msg.author.toString(), true)
                        .addField("Length:", (minutes + " minutes " + seconds + " seconds"), true)
                        .addField("Uploaded By:", author, true)
                        .addField("URL:", ("[Click Here](" + String(songlink) + ")"), true));
                    start_play(msg, server_queue, client);
                    server_queue.playing_state[msg.guild.id] = true;
                }



                else if (server_queue.playing_state[msg.guild.id] === true) {
                    console.log("PLAYING STATE IS TRUE")
                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setImage(img_link)
                        .setTitle("Added to Queue: " + info['title'].toString())
                        .addField("Added By:", msg.author.toString(), false)
                        .addField("Length:", (minutes + " minute(s) " + seconds + " seconds"), true)
                        .addField("Uploaded By:", author, true)
                        .addField("URL:", ("[Click Here](" + String(songlink) + ")"), true));
                }
                //msg.delete()
            }
            else {
                msg.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(String(err)));
                //msg.delete();
            }

        })

    }
}




//--------------------------------------------------------------


module.exports = {
    //pre         :
    //post        :
    //description :
    join_vc: function (msg, client) {
        if (msg.member.voice)
            msg.member.voice.channel.join();
    },
    //pre         :
    //post        :
    //description :
    leave_vc: function (msg, client) {
        msg.member.voice.channel.leave();
        server_queue.playing_state[msg.guild.id] = false;
    },
    //pre         :
    //post        :
    //description :
    add_song: async function (msg, client, args, db) {

        console.log("PLAYING SONG");
        console.log(msg.attachments.size);
        if (msg.attachments.size !== 0) {
            if (msg.attachments.first().name.split(".").pop() === `mp3`) {
                console.log("IS MP3")
                if (args[0] === undefined) {
                    msg.channel.send(new Discord.MessageEmbed().setTitle("Need Name for Song"));
                    //msg.delete();
                    return;
                }


                download(msg.attachments.first().url, `./music/${msg.id}.mp3`, () => {
                    //SANITIZE
                    db.prepare(`INSERT INTO '${msg.guild.id}_music' VALUES('${args[0]}','./music/${msg.id}.mp3')`).run();
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Added Song: " + args[0].toString()).addField("Added By:", msg.author.toString()));
                    //msg.delete();
                })

            }
            else {
                msg.channel.send(new Discord.MessageEmbed().setTitle("Tried to Add File that Isn't an MP3"));
                //msg.delete();
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
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Added Song: " + args[0].toString()).addField("Added By:", msg.author.toString()));
                    //msg.delete();
                }).catch(err => {
                    msg.channel.send(new Discord.MessageEmbed().setColor('#0000FF').setTitle("Unable To Add Song"));
                    //msg.delete();
                    console.error(err);
                    fs.unlink(`./music/${msg.id}.mp3`, err2 => {
                        if (err2) {
                            console.error(err2)
                            return
                        }
                    });
                });

        }

    },
    //pre         :
    //post        :
    //description :
    play: async function (msg, client, args, db) {
        server_queue = create_server_queues(server_queue, client);
        if (is_in_database_as_song_name(db, msg.guild.id, args[0])) {
            //SANITIZE
            var returned_value = db.prepare(`SELECT path FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).get();
            console.log("returned_value is ")
            console.log(returned_value)
            var path = returned_value.path;
            console.log(path + " IS PATH TO NEW SONG");
            if (msg.member.voice) {
                console.log(server_queue.playing_state[msg.guild.id] + " IS PLAYING STATE")

                server_queue[msg.guild.id].push({ path: path, name: args[0] });



                if (server_queue.playing_state[msg.guild.id] === false) {
                    console.log("PLAYING STATE IS FALSE")
                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setTitle("Now Playing: " + args[0].toString()).addField("Added By:", msg.author.toString()));
                    //msg.delete();
                    console.log("CALLING START PLAY")
                    start_play(msg, server_queue, client);
                }



                else if (server_queue.playing_state[msg.guild.id] === true) {
                    console.log("PLAYING STATE IS TRUE")

                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setTitle("Added to Queue: " + args[0].toString()).addField("Added By:", msg.author.toString()));
                    //msg.delete();
                }
            }

        }

    },
    //pre         :
    //post        :
    //description :
    play_no_messages: async function (msg, client, song_name, db) {
        server_queue = create_server_queues(server_queue, client);
        if (is_in_database_as_song_name(db, msg.guild.id, song_name)) {
            //SANITIZE
            var returned_value = db.prepare(`SELECT path FROM '${msg.guild.id}_music' WHERE name='${song_name}';`).get();
            console.log("returned_value is ")
            console.log(returned_value)
            var path = returned_value.path;
            console.log(path + " IS PATH TO NEW SONG");
            if (msg.member.voice) {
                console.log(server_queue.playing_state[msg.guild.id] + " IS PLAYING STATE")

                server_queue[msg.guild.id].push({ path: path, name: song_name });



                if (server_queue.playing_state[msg.guild.id] === false) {
                    start_play(msg, server_queue, client);
                    server_queue.playing_state[msg.guild.id] = true;
                }



                else if (server_queue.playing_state[msg.guild.id] === true) {
                    console.log("PLAYING STATE IS TRUE")
                }
            }

        }

    },
    //pre         :
    //post        :
    //description :
    remove_song: function (msg, client, args, db) {
        if (is_in_database_as_song_name(db, msg.guild.id, args[0])) {
            //SANITIZE
            var path = db.prepare(`SELECT path FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).get().path;
            db.prepare(`DELETE FROM '${msg.guild.id}_music' WHERE name='${args[0]}';`).run();
            msg.channel.send(new Discord.MessageEmbed().setColor('#FF0000').setTitle("Removed: " + args[0].toString()).addField("Added By:", msg.author.toString()));
            //msg.delete();
            fs.unlink(path, err => {
                if (err) {
                    console.error(err)
                    return
                }
            });
        }
    },
    //pre         :
    //post        :
    //description :
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
        //msg.delete();
    },

    //pre         :
    //post        :
    //description :
    skip: function(msg, client, db){skip(msg, client, db)}


    ,
    //pre         :
    //post        :
    //description :
    list_queue: (msg, client, args) => {
        if (args[0] === "") {
            addedEmbed = new Discord.MessageEmbed().setTitle("Queue");
            addedEmbed.setDescription("`For more info on song do $queue | Number of song in queue`")
            server_queue = create_server_queues(server_queue, client);
            counter = 1
            server_queue[msg.guild.id].forEach(x => {
                extra = "\n";
                if (x.hasOwnProperty('metadata')) {
                    extra += ("> Length is " + x.metadata.minutes + " minute(s) " + x.metadata.seconds + " second(s)\n");
                    extra += ("> Uploaded by " + x.metadata.author);
                }
                addedEmbed.addField("#" + counter + ": Song Name", x.name + extra);
                counter++;

            })
            msg.channel.send(addedEmbed);
            //msg.delete()
        }
        else {
            if (server_queue[msg.guild.id].length < Number(args[0]) - 1) {
                msg.channel.send("Queue is Not that Deep");
            }
            else if (Number(args[0]) === 0) {
                msg.channel.send(new Discord.MessageEmbed().setTitle("Sorry the queue starts at 1"));
            }
            else {
                if (server_queue[msg.guild.id][Number(args[0]) - 1].hasOwnProperty('metadata')) {
                    const obj_data = server_queue[msg.guild.id][Number(args[0]) - 1].metadata;
                    msg.channel.send(new Discord.MessageEmbed().setColor('#00FF00').setImage(img_link)
                        .setTitle("Queue #" + args[0])
                        .addField("Title", obj_data.title, false)
                        .addField("Added By:", obj_data.added_by, true)
                        .addField("Length:", (obj_data.minutes + " minute(s) " + obj_data.seconds + " seconds"), true)
                        .addField("Uploaded By:", obj_data.author)
                        .addField("URL:", "[Click Here](" + String(obj_data.song_link) + ")", true));
                }
            }
        }

    },
    //pre         :
    //post        :
    //description :removes all songs from queue in server
    clear_queue: function (msg, client,db) {
        server_queue = create_server_queues(server_queue, client);
        server_queue[msg.guild.id] = [];
        if (msg.member.voice) {
            try{
                msg.member.voice.channel.leave();
            }
            catch (err){
                console.log(err);
            }
            
        }
        console.log(server_queue);
        server_queue.playing_state[msg.guild.id]=false;
        skip(msg,client,db);
    },
    //pre         :
    //post        :
    //description :returns server_queue global object for use in other files
    get_queues: () => {
        return server_queue;
    },
    //pre         :
    //post        :
    //description :depreciated
    in_database: function (msg, name_of_song, db) {
        return is_in_database_as_song_name(db, msg.guild.id, name_of_song);
    },
    //pre         :
    //post        :
    //description :depreciated
    get_path: function (msg, name_of_song, db) {
        return db.prepare(`SELECT path FROM '${msg.guild.id}_music'`).get().path;
    },
    //pre         :
    //post        :
    //description :
    stream: function (msg, songlink, client) {
        stream(msg, songlink, client);
    },
    search: function (msg, query, client) {
        msg.suppressEmbeds(true);
        ytsr(query, { limit: 3 }, (err, result) => {
            if (err) {
                msg.channel.send(err);
                return;
            }
            let index = false;
            result.items.forEach((x) => {
                if (x.type === "video" && index === false) {
                    console.log(index);
                    stream(msg, x.link, client);
                    index = true;
                    return;
                }

            });
        });
    },
    rickroll: function (msg, client) {
        stream(msg, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', client);
    },
    now_playing: function (msg, client) {
        metadata = server_queue.now_playing[msg.guild.id];
        console.log(metadata);

        message = new Discord.MessageEmbed().setColor('#00FF00');
        console.log('hi');
        console.log(111111111000000000000);
        console.log(111111111000000000000);
        console.log(111111111000000000000);
        //console.log(metadata);
        if (server_queue.playing_state[msg.guild.id]) {
            message.addField("URL:", "[Click Here](" + String(metadata.song_link) + ")", true);
            message.setTitle("Now Playing: " + metadata.title, false);
            message.addField("Added By:", metadata.added_by, true);
            message.addField("Length:", (metadata.minutes + " minute(s) " + metadata.seconds + " seconds"), true);
            message.addField("Uploaded By:", metadata.author, true);
            msg.channel.send(message);
        }
        else {
            msg.channel.send("Nothing is playing")
        }

    }

}