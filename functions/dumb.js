const owoify = require('owoify-js').default

module.exports = {
    owo: function (msg, term, severity) {
        var str = 'owo';
        if (severity === '1') {
            str = 'uwu';
        }
        else if (severity === '2') {
            str = 'uvu';
        }
        msg.channel.send(owoify(term,str))
        msg.delete();
    }
}