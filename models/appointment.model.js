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
});
const cases = mongoose.model("appointments", casesSchema);

module.exports = cases;
