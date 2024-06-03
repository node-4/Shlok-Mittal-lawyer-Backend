const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        image: {
                type: String,
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
});

module.exports = mongoose.model('caseManager', termsAndConditionsSchema);
