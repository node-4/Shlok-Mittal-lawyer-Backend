const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        required: true
    },
    title: {
        type: String,
    },
    date: {
        type: Date,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isEnable: {
        type: Boolean,
        default: false
    },
    isPush: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);