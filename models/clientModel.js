const mongoose = require("mongoose");
const clientSchema = mongoose.Schema({
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
});
const clientModel = mongoose.model("clientModel", clientSchema);
module.exports = clientModel;
