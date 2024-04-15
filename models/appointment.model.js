const mongoose = require("mongoose");
const casesSchema = mongoose.Schema({
    meetingId: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cases",
    },
    appointmentStatus: {
        type: String,
        default: "Pending",
    },
    appointmentType: {
        type: String,
    },
    appointmentDate: {
        type: Date,
    },
    appointmentTime: {
        type: String,
    },
    totalTime: {
        type: String,
    },
    joinStatus: {
        type: String,
        enum: ["Accept", "Pending"],
    },
    callType: {
        type: String,
        enum: ["INSTANT", "BOOKING"]
    },
    lawyers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
    youfeel: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
}, { timestamps: true });
const cases = mongoose.model("appointments", casesSchema);
module.exports = cases;
