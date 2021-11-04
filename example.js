let api = require('./main')

async function runn() {
    api.initiateGMAILApi('path/to/credentials.json', 'path/to/token.json', onPostLoad)
}

async function onPostLoad(auth) {

}

await runn()