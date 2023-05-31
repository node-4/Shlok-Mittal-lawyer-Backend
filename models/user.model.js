const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        fullName: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        languageKnow: {
            type: String,
        },
        image:{
            type: String,
        },
        phone: {
            type: String,
        },
        email: {
            type: String,
            minLength: 10,
        },
        password: {
            type: String,
        },
        firstLineAddress: {
            type: String,
        },
        secondLineAddress: {
            type: String,
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        },
        pincode: {
            type: Number,
        },
        barRegistrationNo: {
            type: String,
        },
        barRegistrationImage: {
            type: String,
        },
        barCertificateNo: {
            type: String,
        },
        barCertificateImage: {
            type: String,
        },
        aadhar: {
            type: String,
        },
        otp: {
            type: String,
        },
        otpExpiration: {
            type: Date,
        },
        accountVerification: {
            type: Boolean,
            default: false,
        },
        whatAppNotification: {
            type: Boolean,
            default: false,
        },
        blogNotification: {
            type: Boolean,
            default: false,
        },
        userType: {
            type: String,
            enum: ["CUSTOMER", "LAWYER", "ADMIN"],
        },
        expertises: {
            expertise: {
                type: Array,
            },
        },
        skills: {
            skill: {
                type: Array,
            },
        },
        bio: {
            type: String,
        },
        hearingFee: {
            type: String,
        },
        experiance: {
            type: String,
        },
        languages: {
            type: String,
        },
        wallet: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
