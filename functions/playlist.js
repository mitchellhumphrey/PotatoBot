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
///Make a function to list all songs in a function
///Make sure songs that no longer exist dont break stuff
///Create a function to clean up all playlists by delteing songs that no longer exist
///Update help file
///
///
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
*/
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}




module.exports = {
    test_playlist: function (msg, client, db) {
        list_of_songs = ["devour", "BrainPower", "BrainPower", "BrainPower",];
        list_of_songs.forEach(x => {
            voice.play_no_messages(msg, client, x, db);
        })
    },
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



            /*args.forEach(x=>{
                if (voice.in_database(msg, x, db)) {
                    console.log(voice.get_path(msg, x, db));
                    new_songs.push(x);
                }
                else {
                    msg.channel.send(x + " Is Not a Song Silly");
                }
            })
            if (new_songs.length === 0){
                songs_JSON = JSON.parse(db.prepare(`SELECT JSON_as_string FROM '${msg.guild.id}_playlist' WHERE playlist_name='${name}';`).get().JSON_as_string)
                songs_JSON.songs.concat(new_songs);
                db.prepare(`DELETE FROM '${msg.guild.id}_playlist' WHERE playlist_name = '${name}';`).run();
                db.prepare(`INSERT INTO '${msg.guild.id}_playlist' VALUES('${name}','${JSON.stringify(songs_JSON.songs)}')`).run();

            }
            else {
                console.log("no new songs to add");
            }*/
        }
    },
    delete_playlist: function (msg, client, db, args) {

    }
}
