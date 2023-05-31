const mongoose = require('mongoose');
const helpandSupport = mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
    },
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