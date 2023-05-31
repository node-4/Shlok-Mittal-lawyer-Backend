const mongoose = require("mongoose");
const skillExpertiseSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    expertise: [
        {
            expertise: {
                type: String,
            },
        },
    ],
    skill: [
        {
            skill: {
                type: String,
            },
        },
    ],
});
const skillExpertise = mongoose.model("skillExpertise", skillExpertiseSchema);
module.exports = skillExpertise;
