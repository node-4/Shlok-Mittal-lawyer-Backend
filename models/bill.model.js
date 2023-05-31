const mongoose = require("mongoose");
const billsSchema = mongoose.Schema({
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    billTo: {
        type: String,
    },
    pinCode: {
        type: String,
    },
    houseNo: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    completeAddress: {
        type: String,
    },
    addressType: {
        type: String,
    },
});
const bills = mongoose.model("bills", billsSchema);
module.exports = bills;
