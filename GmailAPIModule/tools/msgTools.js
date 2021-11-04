const self = module.exports = {

    /**
     * Will return the person who sent the message
     * @param msg
     * @return {*}
     */
    getFrom: function (msg) {
        let fromFullStr = self.getRaw(msg, "From").replaceAll("\"","")
        let emailStartIdx = fromFullStr.lastIndexOf('<')
        let fullName = fromFullStr.substring(0, emailStartIdx - 1)
        let email = fromFullStr.substring(emailStartIdx + 1, fromFullStr.length - 1)
        return {"fullName": fullName, "email": email}
    },

    /**
     * Will return the subject of the message
     * @param msg
     * @return {*}
     */
    getSubject: function (msg) {
        return self.getRaw(msg, "Subject")
    },


    /**
     * a free raw function to find an attribute name
     */
    getRaw: function (msg, attribName) {
        return filterBy(msg, attribName)[0].value
    }
}

function filterBy(msg, attribName) {
    return msg.data.payload.headers.filter(obj => obj.name === attribName)
}