const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["TERMS&CONDITION", "PRIVACY POLICY", "ABOUTUS"],
    },
    descriptionArray: [{
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
    }],
    aboutType: {
        type: String,
        enum: ["Main", "about"]
    },
});

module.exports = mongoose.model('TermsAndConditions', termsAndConditionsSchema);
