const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        categoryId: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "category",
            required: true,
        }],
        fullName: {
            type: String,
            default: "",
        },
        firstName: {
            type: String,
            default: "",
        },
        lastName: {
            type: String,
            default: "",
        },
        languageKnow: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
            minLength: 10,
        },
        password: {
            type: String,
            default: "",
        },
        refferalCode: {
            type: String,
            default: "",
        },
        firstLineAddress: {
            type: String,
            default: "",
        },
        secondLineAddress: {
            type: String,
            default: "",
        },
        country: {
            type: String,
            default: "",
        },
        state: {
            type: String,
            default: "",
        },
        district: {
            type: String,
            default: "",
        },
        pincode: {
            type: Number,
        },
        barRegistrationNo: {
            type: String,
            default: "",
        },
        barRegistrationImage: {
            type: String,
            default: "",
        },
        barCertificateNo: {
            type: String,
            default: "",
        },
        barCertificateImage: {
            type: String,
            default: "",
        },
        aadhar: {
            type: String,
            default: "",
        },
        otp: {
            type: String,
            default: "",
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
        kyc: {
            type: String,
            default: "",
        },
        userType: {
            type: String,
            default: "",
            enum: ["CUSTOMER", "LAWYER", "ADMIN"],
        },
        expertises: [{
            expertise: {
                type: String,
            },
        }],
        skills: [{
            skill: {
                type: String,
            },
        }],
        bio: {
            type: String,
            default: "",
        },
        hearingFee: {
            type: Number,
            default: 0,
        },
        consultancyCost: {
            type: Number,
            default: 0,
        },
        minofconsultance: {
            type: Number,
            default: 0,
        },
        experiance: {
            type: String,
            default: "",
        },
        languages: {
            type: Array,
        },
        rating: {
            type: Number,
            default: 0,
        },
        wallet: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
