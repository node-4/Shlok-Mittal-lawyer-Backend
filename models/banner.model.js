const mongoose = require('mongoose');


const bannerSchema = mongoose.Schema({
    image: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        require: false
    },
    link: {
        type: String,
        require: false
    },
    title: {
        type: String,
        require: false
    },
    date: {
        type: Date,
    }
})

const banner = mongoose.model('banner', bannerSchema);

module.exports = banner;

