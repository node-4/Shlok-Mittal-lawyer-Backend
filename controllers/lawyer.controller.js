const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const caseModel = require("../models/cases.model");
const billModel = require("../models/bill.model");
const skillExpertise = require("../models/skillExpertise.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({
            $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }],
        });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "LAWYER";
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
        const updated = await User.findOneAndUpdate({ phone: phone }, userObj, {
            new: true,
        });
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
        const accessToken = jwt.sign({ id: user.email }, authConfig.secret, {
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
        userObj.accountVerification = true;
        const updated = await User.findByIdAndUpdate(
            { id: user._id },
            userObj,
            { new: true }
        );
        const accessToken = jwt.sign({ id: user.phone }, authConfig.secret, {
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
exports.resendOTP = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const otp = newOTP.generate(4, {
            alphabets: false,
            upperCase: false,
            specialChar: false,
        });
        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        const updated = await User.findOneAndUpdate(
            { _id: id },
            { otp, otpExpiration },
            { new: true }
        );
        res.status(200).send({ message: "OTP resent", otp: otp });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        if (req.body.newPassword == req.body.confirmPassword) {
            const updated = await User.findOneAndUpdate(
                { _id: id },
                { $set: { password: bcrypt.hashSync(req.body.newPassword) } },
                { new: true }
            );
            res.status(200).send({
                message: "Password update successfully.",
                data: updated,
            });
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
        const { name, email, phone, password, bio, hearingFee, image, experiance, languages } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.name = name || user.name;
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
        // console.log(updated);
        res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "internal server error " + err.message,});
    }
};
exports.createCase = async (req, res) => {
    try {
        req.body.lawyer = req.user.id;
        const result = await caseModel.create(req.body);
        res.status(200).send({ msg: "Cases added", data: result });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.updateCase = async (req, res) => {
    try {
        const data = await caseModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        res.status(200).send({ msg: "updated", data: data });
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
        if (req.Params.lawyer != (null || undefined)) {
            const data = await caseModel.find({ lawyer: req.Params.lawyer });
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            res.status(200).send({ data: data });
        } else {
            const data = await caseModel.find();
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            res.status(200).send({ data: data });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
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
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
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
            const data = await skillExpertise.findOne(
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
            const data = await skillExpertise.findOne(
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