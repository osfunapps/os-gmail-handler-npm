Introduction
------------

This module contains simplified Gmail API commands (search/read/send emails).

## Installation
Install via npm:
```js
npm i os-gmail-handler
```

## Allow Gmail API
To allow this repo to run, you have to supply your gmail JSON credentials to the handler. 

To do so, follow these steps:
1) Go to the Google Cloud Console and open a new project. Search for "Gmail API", enable it
2) In the Google Cloud Console, Click on the drawer at the top left and click API & Services -> Credentials
3) At the top "Create credentials" -> "OAuth client ID" -> "Desktop app"
4) Save the credentials JSON on a secured location on your computer

# Usage       

- Require the api handler:
```js
const gmailApi = require("os-gmail-handler")
```

Then initiate the handler and run it:
```js
function start() {
    gmailApi.init("path/to/your/credentials.json", "path/to/store/your/token.json", onPostLoad)
}

// this callback will run after the API initialization
async function onPostLoad(auth) {

    // use the msgSearcher instance to find new messages from your girlfriends.
    // (change the query to search whatever you like. Be advised that it doesn't work exactly like the search in the Gmail web app. Read more about it here:
    // https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list)
    let msgs = await gmailApi.msgSearcher.searchMessages(auth, "subject:Hey honey", gmailApi.msgSearcher.LABEL_UNREAD)

    // run on all of those messages
    for (let i = 0; i < msgs.length; i++) {
        
        // read them one by one
        let msgRead = await gmailApi.msgReader.readMessage(auth, msgs[i].id)
        
        // get the name of the girlfriend
        let from = gmailApi.msgTools.getFrom(msgRead)
        
        // send a new message to the girlfriend
        await gmailApi.msgSender.sendMessage(auth, from.email, "Whatcha doin tonight?", "haha funny and corny content")
    }
}
```
And more...


## Links -> see more tools
* [os-tools-npm](https://github.com/osfunapps/os-tools-npm) -> This module contains fundamental functions to implement in an npm project
* [os-file-handler-npm](https://github.com/osfunapps/os-file-handler-npm) -> This module contains fundamental files manipulation functions to implement in an npm project
* [os-file-stream-handler-npm](https://github.com/osfunapps/os-file-stream-handler-npm) -> This module contains read/write and more advanced operations on files
* [os-xml-handler-npm](https://github.com/osfunapps/os-xml-handler-npm) -> This module will build, read and manipulate an xml file. Other handy stuff is also available, like search for specific nodes

[GitHub - osfunappsapps](https://github.com/osfunapps)

## Licence
ISC