const mongoose = require('mongoose');
const schema = mongoose.Schema;
const blogSchema = mongoose.Schema({
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        image: {
                type: String
        },
        type: {
                type: String,
                enum: ['trustedBy', 'whyuserlove']
        },
}, { timestamps: true })
module.exports = mongoose.model('whyuserlove', blogSchema)