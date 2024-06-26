const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    user2: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    gst: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    paymentMode: {
        type: String,
    },
    type: {
        type: String,
    },
    accountNumber: {
        type: String
    },
    id: {
        type: String,
    },
    ifsc: {
        type: String
    },
    upiId: {
        type: String
    },
    name: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    message: {
        type: String
    },
    paymentReply: {
        type: String
    },
    screenShot: {
        type: String
    },
    Status: {
        type: String,
    },
    transactionType: {
        type: String,
        enum: ["order", "Wallet"],
        default: "Wallet",
    }

});

const transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
