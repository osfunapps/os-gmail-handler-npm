const {google} = require('googleapis');

const self = module.exports = {

    /**
     * Will read a message by id
     */
    readMessage: async function (auth, messageId) {
        return new Promise(async function (resolve, reject) {
            const gmail = google.gmail({version: 'v1', auth});
            gmail.users.messages.get({
                auth: auth,
                userId: 'me',
                id: messageId
            }, function (err, response) {
                resolve(response, err)
            });
        })
    },
}