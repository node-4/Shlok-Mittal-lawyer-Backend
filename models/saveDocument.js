const mongoose = require("mongoose");
const documentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    documents: [{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "document",
            },
        }],
});
const document = mongoose.model("saveDocument", documentSchema);

module.exports = document;
