const mongoose = require('mongoose');
const helpandSupport = mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String
    },
    mobile: {
        type: Number
    },
    query: {
        type: String
    }
})
const help = mongoose.model('help&suuport', helpandSupport);
module.exports = help