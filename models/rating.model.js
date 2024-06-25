const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
            required: true,
        },
        lawyerId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
            required: true,
        },
        categoryId: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "category",
            required: true,
        }],
        rating: {
            type: Number,
        },
        comment: {
            type: String,
        },
        subject: {
            type: String,
        },
        date: {
            type: Date,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("rating", schema);
