const mongoose = require('mongoose');
const schema = mongoose.Schema;
const blogSchema = mongoose.Schema({
        blogCategoryId: {
                type: schema.Types.ObjectId,
                ref: "blogCategory",
        },
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        image: {
                type: String
        },
        view: {
                type: Number,
                default: 0
        }
}, { timestamps: true })
module.exports = mongoose.model('blog', blogSchema)