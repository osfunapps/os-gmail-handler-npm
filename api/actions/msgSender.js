const {google} = require('googleapis');

const self = module.exports = {
    /**
     * Will send message, make sure to initiate the auth instance before running this
     */
    sendMessage: async function (auth, to, subject, message) {
        return new Promise(async function (resolve, reject) {
            const raw = makeBody(to, subject, message);
            const gmail = google.gmail({version: 'v1', auth});
            gmail.users.messages.send({
                auth: auth,
                userId: 'me',
                resource: {
                    raw: raw
                }

            }, function (err, response) {
                resolve(response, err)
            });
        })
    },
}

function makeBody(to, subject, message) {
    const str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    return new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
}