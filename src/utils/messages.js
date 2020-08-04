const generateMessage = (username, text) =>{
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username, text) =>{
    return {
        url: text,
        createdAt: new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}