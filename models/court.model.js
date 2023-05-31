const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        courtCategoryId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "case&courtCategory",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("court", schema);
