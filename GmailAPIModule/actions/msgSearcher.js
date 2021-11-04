const {google} = require('googleapis');

const self = module.exports = {

    /**
     * Will search messages. Query example: "subject:IRS receipts after:2021/9/27 to:(finance@my-organization.com)"
     */
    searchMessages: async function (auth, query, maxResults=500) {
        return new Promise(function (resolve) {
            const gmail = google.gmail({version: 'v1', auth});
            if(!query.startsWith("'")) {
                query = `'${query}`
            }
            if(!query.endsWith("'")) {
                query = `${query}'`
            }
            gmail.users.messages.list(
                {
                    userId: 'me',
                    q: query,
                    maxResults: maxResults
                }, (err, res) => {
                    if (err) {
                        resolve(err);
                        return;
                    }
                    if (!res.data.messages) {
                        resolve([]);
                        return;
                    }
                    resolve(res.data.messages);
                }
            );
        }.bind())
    },
}