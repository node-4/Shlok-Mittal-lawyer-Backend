const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const caseModel = require("../models/cases.model");
const appointment = require("../models/appointment.model");
const billModel = require("../models/bill.model");
const skillExpertise = require("../models/skillExpertise.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const rating = require("../models/rating.model");
exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({
            $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }],
            userType: "LAWYER",
        });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "LAWYER";
            req.body.refferalCode = await reffralCode();
            const userCreate = await User.create(req.body);
            res.status(200).send({
                message: "registered successfully ",
                data: userCreate,
            });
        } else {
            res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.loginWithPhone = async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone: phone, userType: "LAWYER" });
        if (!user) {
            return res.status(400).send({ msg: "not found" });
        }
        const userObj = {};
        userObj.otp = newOTP.generate(4, {
            alphabets: false,
            upperCase: false,
            specialChar: false,
        });
        userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        userObj.accountVerification = false;
        const updated = await User.findOneAndUpdate(
            { phone: phone, userType: "LAWYER" },
            userObj,
            {
                new: true,
            }
        );
        res.status(200).send({ userId: updated._id, otp: updated.otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "LAWYER" });
        if (!user) {
            return res
                .status(404)
                .send({ message: "user not found ! not registered" });
        }
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: "Wrong password" });
        }
        const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }
        if (user.otp !== otp || user.otpExpiration < Date.now()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const updated = await User.findByIdAndUpdate(
            { _id: user._id },
            { accountVerification: true },
            { new: true }
        );
        const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        res.status(200).send({
            message: "logged in successfully",
            accessToken: accessToken,
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ error: "internal server error" + err.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user.id, });
        if (data) {
            return res.status(200).json({ message: "get Profile", data: data });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.resendOTP = async (req, res) => {
    const { phone } = req.params;
    try {
        const user = await User.findOne({ phone: phone, userType: "LAWYER" });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const otp = newOTP.generate(4, {
            alphabets: false,
            upperCase: false,
            specialChar: false,
        });
        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        const accountVerification = false;
        const updated = await User.findOneAndUpdate(
            { _id: user._id },
            { otp, otpExpiration, accountVerification },
            { new: true }
        );
        res.status(200).send({ message: "OTP resent", otp: otp });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.resetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        if (req.body.newPassword == req.body.confirmPassword) {
            const updated = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: bcrypt.hashSync(req.body.newPassword) } },
                { new: true }
            );
            res.status(200).send({ message: "Password update successfully.", data: updated, });
        } else {
            res.status(501).send({
                message: "Password Not matched.",
                data: {},
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            bio,
            hearingFee,
            image,
            experiance,
            languages,
        } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = image || user.image;
        user.bio = bio || user.bio;
        user.hearingFee = hearingFee || user.hearingFee;
        user.experiance = experiance || user.experiance;
        user.languages = languages || user.languages;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "internal server error " + err.message, });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, password, kyc, whatAppNotification, image, blogNotification, } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = image || user.image;
        user.kyc = kyc || user.kyc;
        user.whatAppNotification =
            whatAppNotification || user.whatAppNotification;
        user.blogNotification = blogNotification || user.blogNotification;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        // console.log(updated);
        res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.createCase = async (req, res) => {
    try {
        req.body.lawyer = req.user.id;
        const result = await caseModel.create(req.body);
        res.status(200).send({ msg: "Cases added", data: result });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.updateCase = async (req, res) => {
    try {
        const data = await caseModel.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        req.body.hearing = data.hearing + 1;
        const update = await caseModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!update) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ msg: "updated", data: update });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.addNote = async (req, res) => {
    try {
        const data = await caseModel.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        const update = await caseModel.findByIdAndUpdate(req.params.id, { $push: { notes: req.body.note } }, { new: true, });
        if (!update) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ msg: "updated", data: update });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getCase = async (req, res) => {
    try {
        const data = await caseModel.find({ lawyer: req.user.id }).populate('userId');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.upcommingCase = async (req, res) => {
    try {
        let date = new Date(Date.now()).getDate();
        let month = new Date(Date.now()).getMonth() + 1;
        let year = new Date(Date.now()).getFullYear();
        let month1, date1;
        if (month < 10) {
            month1 = '' + 0 + month;
        } else {
            month1 = month
        }
        if (date < 10) {
            date1 = '' + 0 + date;
        }
        else {
            date1 = date
        }
        let fullDate = (`${year}-${month1}-${date1}`).toString()
        const d = new Date(fullDate);
        let text = d.toISOString();
        const data = await caseModel.find({ lawyer: req.user.id, hearingDate: { $gte: text } }).populate('userId');
        if (!data || data.length === 0) {
            return res.status(400).send({ status: 404, msg: "not found" });
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.upcomingAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ lawyer: req.user.id, appointmentStatus: "Pending" }).populate('lawyer');
        res.status(200).json({ message: "All upcoming appointment", data: FindAppointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message, });
    }
};
exports.allCancelAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ lawyer: req.user.id, appointmentStatus: "Cancel" });
        res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.pastAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ lawyer: req.user.id, appointmentStatus: "Done" });
        res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getIdCase = async (req, res) => {
    try {
        const data = await caseModel.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.deleteCase = async (req, res) => {
    try {
        const data = await caseModel.findByIdAndDelete(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ msg: "deleted", data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error",
            error: err.message,
        });
    }
};
exports.skillExpertise = async (req, res) => {
    try {
        let findSkill = await skillExpertise.findOne({ userId: req.user.id });
        if (findSkill) {
            res.status(200).send({ msg: "skill data found", data: findSkill });
        } else {
            return res.status(404).send({ msg: "not found" });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.addskill = async (req, res) => {
    try {
        let findSkill = await skillExpertise.findOne({ userId: req.user.id });
        if (findSkill) {
            let skill = [];
            for (let i = 0; i < findSkill.skill.length; i++) {
                skill.push(findSkill.skill[i]);
            }
            let obj = {
                skill: req.body.skill,
            };
            skill.push(obj);
            const data = await skillExpertise.findOneAndUpdate(
                { userId: req.user.id },
                { $set: { skill: skill } },
                { new: true }
            );
            res.status(200).send({ msg: "skill added", data: data });
        } else {
            let skill = [];
            let obj = {
                skill: req.body.skill,
            };
            skill.push(obj);
            let obj1 = {
                userId: req.user.id,
                skill: skill,
            };
            const result = await skillExpertise.create(obj1);
            res.status(200).send({ msg: "skill added", data: result });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.addExpertise = async (req, res) => {
    try {
        let findSkill = await skillExpertise.findOne({ userId: req.user.id });
        if (findSkill) {
            let expertise = [];
            for (let i = 0; i < findSkill.expertise.length; i++) {
                expertise.push(findSkill.expertise[i]);
            }
            let obj = {
                expertise: req.body.expertise,
            };
            expertise.push(obj);
            const data = await skillExpertise.findOneAndUpdate(
                { userId: req.user.id },
                { $set: { expertise: expertise } },
                { new: true }
            );
            res.status(200).send({ msg: "Expertise added", data: data });
        } else {
            let expertise = [];
            let obj = {
                expertise: req.body.expertise,
            };
            expertise.push(obj);
            let obj1 = {
                userId: req.user.id,
                expertise: expertise,
            };
            const result = await skillExpertise.create(obj1);
            res.status(200).send({ msg: "Expertise added", data: result });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.createBill = async (req, res) => {
    let findUser = await User.findById({ _id: req.params.userId });
    if (!findUser) {
        return res.status(400).send({ msg: "not found" });
    } else {
        req.body.lawyerId = req.user.id;
        req.body.customerId = findUser._id;
        const result = await billModel.create(req.body);
        res.status(200).send({ msg: "bill added", data: result });
    }
};
exports.getAllbill = async (req, res) => {
    try {
        const data = await billModel.find({ lawyerId: req.user.id });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getAllRating = async (req, res) => {
    try {
        const data = await rating.find({ lawyerId: req.user.id }).populate('userId');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getrefferalCode = async (req, res) => {
    try {
        const usersDocument = await User.findOne({ _id: req.user.id, });
        if (usersDocument) {
            return res.status(200).json({ message: "get Profile", data: usersDocument.refferalCode });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        res.status(501).send({ message: "server error.", data: {}, });
    }
};
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}
