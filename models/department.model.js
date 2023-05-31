const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("department", schema);
