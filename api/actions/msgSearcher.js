const {google} = require('googleapis');

module.exports.LABEL_INBOX = "INBOX"
module.exports.LABEL_SENT = "SENT"
module.exports.LABEL_UNREAD = "UNREAD"
module.exports.LABEL_STARRED = "STARRED"
module.exports.LABEL_DRAFT = "DRAFT"

/**
 * Will search for messages
 *
 * @param auth The gmail instantiated obj
 * @param query Query example: "subject:IRS receipts after:2021/9/27 to:(finance@my-organization.com)
 * @param label LABEL_INBOX, LABEL_SENT etc...
 * @param maxResults set the maximum messages here
 */
module.exports.searchMessages = async function (auth, query, label, maxResults = 500) {
    return new Promise(function (resolve) {
        const gmail = google.gmail({version: 'v1', auth});
        if (!query.startsWith("'")) {
            query = `'${query}`
        }
        if (!query.endsWith("'")) {
            query = `${query}'`
        }
        gmail.users.messages.list(
            {
                labelIds: [label],
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
}
