const mongoose = require("mongoose");
const casesSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    caseTitle: {
        type: String,
    },
    caseNumber: {
        type: String,
    },
    caseName: {
        type: String,
    },
    courtNumber: {
        type: String,
    },
    judge: {
        type: String,
    },
    caseStatus: {
        type: String,
    },
    nextHearingDate: {
        type: Date,
    },
    lastDateOfHearing: {
        type: Date,
    },
    setRemainder: {
        type: Boolean,
        default: false
    },
    remainderDate: {
        type: Date,
    },
    hearingTime: {
        type: String,
    },
    notes: {
        type: Array,
    },
    hearing: {
        type: Number,
        default: 1
    },
    remainderType: {
        type: String,
        enum: ["Daily", "Hourly", "Weekly", "Monthly"],
    },
    remainderTime: {
        type: String,
    },
    type: {
        type: String,
        enum: ["General", "Urgent"],
    },
});
const cases = mongoose.model("cases", casesSchema);

module.exports = cases;
