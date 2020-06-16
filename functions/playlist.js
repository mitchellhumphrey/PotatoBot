const Discord = require('discord.js');
const Database = require('better-sqlite3');
const voice = require('./voice.js');
const async = require("async");

/*
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////TODO////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///Add Embeds for all functions
///Make a delete playlist function
///Make a list playlists function
///Make a function to list all songs in a playlist
///Make sure songs that no longer exist dont break stuff
///Create a function to clean up all playlists by delteing songs that no longer exist
///     call this function whenever voice.delete_song is used
///Update help file
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/



//pre         :
//post        :randomizes index of array
//description :shuffles the order of items in an array
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}




module.exports = {
    //pre         :first argument is not already in database (add check for this)
    //post        :inserts a new playlist into the database
    //description :creates a database entry that contains a playlist
    make_playlist: function (msg, client, db, args) {
        var name = args.shift();
        var new_playlist = []
        args.forEach(x => {
            if (voice.in_database(msg, x, db)) {
                console.log(voice.get_path(msg, x, db));
                new_playlist.push(x);
            }
            else {
                console.log(x + " Is Not a Song Silly");
            }
        })
        if (new_playlist.length !== 0) {
            songs = { songs: new_playlist };
            db.prepare(`INSERT INTO '${msg.guild.id}_playlist' VALUES('${name}','${JSON.stringify(songs)}')`).run()
            console.log("inserted into table")
        }
    },
    //pre         :playlist exists in database
    //post        :adds song to queue
    //description :plays a playlist of songs in the order they appear inside the playlist
    play_playlist: function (msg, client, db, args) {
        name = args[0];
        if (db.prepare(`SELECT playlist_name FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get()) {
            console.log()
            songs_JSON = JSON.parse(db.prepare(`SELECT JSON_as_string FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get().JSON_as_string)
            songs_JSON.songs.forEach(x => {
                voice.play_no_messages(msg, client, x, db);
            })

        }
        else {
            console.log("playlist doesnt exist")
        }
    },
    //pre         :playlist exists in database
    //post        :adds song to queue in a random order
    //description :plays a playlist of songs randomly
    play_playlist_random: function (msg, client, db, args) {
        name = args[0];
        if (db.prepare(`SELECT playlist_name FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get()) {
            console.log()
            songs_JSON = JSON.parse(db.prepare(`SELECT JSON_as_string FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get().JSON_as_string)
            console.log("THE SONG ARRAY IS " + songs_JSON.songs);
            shuffle(songs_JSON.songs);
            songs_JSON.songs.forEach(x => {
                voice.play_no_messages(msg, client, x, db);
            })

        }
        else {
            console.log("playlist doesnt exist")
        }
    },
    //pre         :playlist that exists in database
    //post        :
    //description :
    add_to_playlist: function (msg, client, db, args) {
        name = args.shift();
        new_songs = [];
        if (db.prepare(`SELECT playlist_name FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get()) {

            async.each(args, function (item, callback) {
                if (voice.in_database(msg, item, db)) {
                    console.log(voice.get_path(msg, item, db));
                    new_songs.push(item);
                }
                else {
                    //msg.channel.send
                    console.log(item + " Is Not a Song Silly");
                }
                callback(null);
            }, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("IN CALLBACK")
                if (new_songs.length !== 0) {
                    console.log("new songs to add");
                    songs_JSON = JSON.parse(db.prepare(`SELECT JSON_as_string FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get().JSON_as_string)
                    songs_JSON.songs = songs_JSON.songs.concat(new_songs);
                    db.prepare(`DELETE FROM '${msg.guild.id}_playlist' WHERE playlist_name = '${name}';`).run();
                    db.prepare(`INSERT INTO '${msg.guild.id}_playlist' VALUES('${name}','${JSON.stringify(songs_JSON)}')`).run();

                }
                else {
                    console.log("no new songs to add");
                }
            });
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Sorry this playlist does not exist"))
        }
    },
    //pre         :
    //post        :
    //description :
    delete_playlist: function (msg, client, db, args) {
        // args[0] : name of playlist to be deleted
        if (db.prepare(`SELECT playlist_name FROM '${msg.guild.id}_playlist' WHERE playlist_name='${args[0]}';`).get()) {
            db.prepare(`DELETE FROM '${msg.guild.id}_playlist' WHERE playlist_name='${args[0]}'`).run()
            msg.channel.send(new Discord.MessageEmbed().setTitle("Playlist " + args[0] + " Deleted"))
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Playlist " + args[0] + " Does Not Exist"))
        }
    },
    //pre         :
    //post        :
    //description :
    clear_playlist: function (msg, client, db, args) {

    },
    //pre         :
    //post        :
    //description :
    repeat: function (msg, client, db, args) {
        //args[0] : song name
        //args[1] : number of repeats 
        if (voice.in_database(msg, args[0], db)) {
            for (var i = 0; i < args[1]; i++) {
                voice.play_no_messages(msg, client, args[0], db);
            }
            msg.channel.send(new Discord.MessageEmbed().setTitle("Added " + args[0] + " " + args[1] + " times"))
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Could not find song " + args[0]))
        }
    },
    //pre         :
    //post        :
    //description :
    list_playlist: function (msg, client, db, args) {
        var addedEmbed = new Discord.MessageEmbed().setTitle("List of Playlists");
        var song_names = '```\n'
        db.prepare(`SELECT * FROM '${msg.guild.id}_playlist'`).all().forEach(x => {
            //console.log(x.name)
            song_names += (x.playlist_name + '\n')
        });
        song_names += "```"
        addedEmbed.addField(msg.guild.name, song_names);
        msg.channel.send(addedEmbed);
        //msg.delete();
    },
    //pre         :valid playlist that is inside database
    //post        :sends message in channel that displays all of the songs in a playlist
    //description :
    list_playlist_content: function (msg, client, db, args) {
        //args[0] is the name of the playlist
        name = args[0];

        if (db.prepare(`SELECT playlist_name FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get()) {
            song_content = "```"
            songs_JSON = JSON.parse(db.prepare(`SELECT JSON_as_string FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get().JSON_as_string)
            songs_JSON.songs.forEach(x => {
                song_content += (x + "\n")
                //msg.channel.send(x);
            })
            song_content += "```"
            msg.channel.send(new Discord.MessageEmbed().setTitle("Playlist: " + name).addField("Contents", song_content, false))
            //msg.delete();
        }
        else {
            msg.channel.send(new Discord.MessageEmbed().setTitle("Sorry the playlist "+name+" does not exist"));
            //msg.delete();
        }

    }
}
