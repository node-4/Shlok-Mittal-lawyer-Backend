const mongoose = require("mongoose");
const casesSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    caseStatus:{
        type: String,
    },
    nextHearingDate: {
        type: Date,
    },
    lastDateOfHearing: {
        type: Date,
    },
});
const cases = mongoose.model("cases", casesSchema);

module.exports = cases;
