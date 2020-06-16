const duck = require('node-duckduckgo');
const Discord = require('discord.js');
const wiki = require('wikijs').default;
const nodeyourmeme = require('nodeyourmeme');
//import wiki from 'wikijs';


module.exports = {
    search: async function (msg, term) {
        try {
            wiki().page(term).then(async function (page) {
                var summary_array = (await page.summary()).split('.');
                var summary = summary_array[0] + '.' + summary_array[1] + '.' + summary_array[2] + '.';
                console.log(summary_array);
                if (summary.length >= 2000) summary += "... (Trimmed for Brevity)";
                var URL = page.url();
                var embed = new Discord.MessageEmbed()
                    .setTitle(page.raw.title)
                    .setDescription(summary)
                    .addField("**URL**", `[Click Here](${URL})`, true)
                    .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wikipedia-logo-v2-en.svg/800px-Wikipedia-logo-v2-en.svg.png");
                msg.channel.send(embed);

            }).catch((err) => {
                console.log(err);
                msg.channel.send(new Discord.MessageEmbed().setTitle("Can not find that article"))
            })
        }
        catch (err) {
            console.log(err);
            msg.channel.send(new Discord.MessageEmbed().setTitle("Can not find that article"))
        }

    },
    meme: async function (msg, term) {
        nodeyourmeme.search(term).then((result) => {
            msg.channel.send(new Discord.MessageEmbed().setTitle(result.name).setDescription(result.about.slice(0, 2000)).addField("URL",`[Click Here](https://knowyourmeme.com/search?q=${result.name.replace(/ /g,"+")})`).setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/KnowYourMeme.png/180px-KnowYourMeme.png'));
            
        })
            .catch((err) => {
                console.log(err);
                msg.channel.send(new Discord.MessageEmbed().setTitle("Couldn't Find That maymay"))
            });

    }
}