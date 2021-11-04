const fs = require('fs');
const {google} = require('googleapis');

// actions
module.exports.msgSearcher = require("./api/actions/msgSearcher")
module.exports.msgSender = require("./api/actions/msgSender")
module.exports.msgReader = require("./api/actions/msgReader")
module.exports.msgTools = require("./api/tools/msgTools")

/**
 * Will initiate the gmail api client.
 * You'll need a path to you're credentials and token to make stuff work.
 *
 * Just:
 * 1) Enable Gmail API in your Google Cloud Console
 * 2) In the Google Cloud Console, Click on the drawer at the top left and click API & Services -> Credentials
 * 3) At the top "Create credentials" -> "OAuth client ID" -> "Desktop app"
 * 4) Save the JSON and point to it in the credentialsPath prop
 * 5) Set a custom path to where you want the token to be stored. (my/token/path.json)
 */
module.exports.init = function (credentialsPath, tokenPath, callback, gmailScopes = DEFAULT_SCOPES) {
    fs.readFile(credentialsPath, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(gmailScopes, tokenPath, JSON.parse(content), callback);
    });
}



// package private
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} scopes holds all of the current scopes to request
 * @param {Object} credentials The authorization client credentials.
 * @param {string} tokenPath the path in which the token will reside
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(scopes, tokenPath, credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(tokenPath, (err, token) => {
        if (err) return self.getNewToken(oAuth2Client, tokenPath, callback, scopes);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 * @param {Object} scopes holds all of the current scopes to request
 * * @param {string} tokenPath the path in which the token will reside
 */
function getNewToken(oAuth2Client, tokenPath, callback, scopes) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', tokenPath);
            });
            callback(oAuth2Client);
        });
    });

}


DEFAULT_SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.metadata',
    'https://www.googleapis.com/auth/gmail.readonly'
];

