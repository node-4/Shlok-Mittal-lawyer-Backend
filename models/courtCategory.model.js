const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("case&courtCategory", schema);
