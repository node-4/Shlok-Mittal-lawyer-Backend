const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["legal", "government"],
    },
    category: {
        type: String,
    },
    info: {
        type: String,
    },
    image: {
        type: String,
        required: true,
    },
    document: {
        type: String,
    },
    payment: {
        type: String,
    },
    advoAssurance: [{
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        }
    }],
    faqs: [{
        question: {
            type: String,
        },
        answer: {
            type: String,
        }
    }]
},
    { timeseries: true }
);
module.exports = mongoose.model("category", schema);
