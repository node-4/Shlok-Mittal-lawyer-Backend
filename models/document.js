const mongoose = require("mongoose");
const documentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    casesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cases",
    },
    image: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        require: false,
    },
}, { timeseries: true });
const document = mongoose.model("document", documentSchema);

module.exports = document;
