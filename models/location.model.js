const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
            required: true,
        },
        address: {
            type: String,
        },
        state: {
            type: String,
        },
        distract: {
            type: String,
        },
        code: {
            type: String,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("location", schema);
