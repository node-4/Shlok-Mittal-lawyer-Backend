const mongoose = require('mongoose');
const blogSchema = mongoose.Schema({
        title: {
                type: String,
        },
        image: {
                type: String

        }
}, { timestamps: true })

module.exports = mongoose.model('blogCategory', blogSchema)