const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const appointment = require("../models/appointment.model");
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
            req.body.userType = "CUSTOMER";
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
        const user = await User.findOne({ phone: phone, userType: "CUSTOMER" });
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
        const user = await User.findOne({ email: email });
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
        let userObj;
        userObj = {
            accountVerification: true
        }
        const updated = await User.findByIdAndUpdate({ _id: user._id },userObj,{ new: true });
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
        const {
            name,
            email,
            phone,
            password,
            kyc,
            whatAppNotification,
            image,
            blogNotification,
        } = req.body;
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
exports.getLawyers = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "LAWYER" });
        if (findLawyer.length === 0) {
            return res.status(404).json({ message: "Lawyer not found" });
        }
        return res.status(200).json(findLawyer);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "server error while getting lawyer",
            error: err.message,
        });
    }
};
exports.SaveDocument = async (req, res) => {
    try {
        const findDocument = await userDocuments.findById({
            _id: req.params.id,
        });
        if (!findDocument) {
            res.status(404).send({ message: "Document not found.", data: {} });
        } else {
            const usersDocument = await saveDocuments.findOne({
                userId: req.user.id,
            });
            if (usersDocument) {
                let documents = [];
                let obj = { id: findDocument._id };
                documents.push(obj);
                for (let i = 0; i < usersDocument.documents.length; i++) {
                    documents.push(usersDocument.documents[i]);
                }
                let update = await saveDocuments.findByIdAndUpdate(
                    { _id: usersDocument._id },
                    { $set: { documents: documents } },
                    { new: true }
                );
                return res
                    .status(200)
                    .json({ message: "updated", data: update });
            } else {
                let documents = [];
                let obj = { id: findDocument._id };
                documents.push(obj);
                const data = { userId: req.user.id, documents: documents };
                const Data = await saveDocuments.create(data);
                return res.status(200).json(Data);
            }
        }
    } catch (error) {
        res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.createAppointment = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.params.id });
        if (findUser) {
            let data = {
                userId: req.user.id,
                lawyer: req.params.id,
                appointmentDate: req.body.date,
                appointmentType: req.body.appointmentType
            };
            const Data = await appointment.create(data);
            return res.status(200).json(Data);
        } else {
            res.status(404).send({ message: "Document not found.", data: {} });
        }
    } catch (error) {
        res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.upcomingAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ userId: req.user.id, appointmentStatus: "Pending" });
        res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.cancelAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ userId: req.user.id, appointmentStatus: "Cancel" });
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
        const FindAppointment = await appointment.find({ userId: req.user.id, appointmentStatus: "Done" });
        res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getAllbill = async (req, res) => {
    try {
        const data = await billModel.find({ customerId: req.user.id });
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