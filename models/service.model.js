const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
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
}, { timeseries: true });
module.exports = mongoose.model("service", schema);
