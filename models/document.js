const mongoose = require("mongoose");
const documentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    image: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
        require: false,
    },
});
const document = mongoose.model("document", documentSchema);

module.exports = document;
