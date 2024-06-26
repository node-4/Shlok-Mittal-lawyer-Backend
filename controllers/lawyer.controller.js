const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const caseModel = require("../models/cases.model");
const appointment = require("../models/appointment.model");
const clientModel = require("../models/clientModel");
const billModel = require("../models/bill.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const rating = require("../models/rating.model");
exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        const data = await User.findOne({ email: req.body.email, userType: "LAWYER" });
        if (!data) {
            return res.status(400).send({ status: 400, data: {}, msg: "Incorrect email or password" });
        } else {
            let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
            // var transporter = nodemailer.createTransport({ timeout: 600000, pool: true, service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "zsukilrhowwtjsoh" } });
            // let mailOptions;
            // mailOptions = { from: 'Shahina Hoja Aesthetics <info@shahinahoja.com>', to: req.body.email, subject: 'Password verification', text: `Your Account Verification Code is ${otp}`, };
            // let info = await transporter.sendMail(mailOptions);
            // if (info) {
            let accountVerification = false;
            let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
            const updated = await User.findOneAndUpdate({ _id: data._id }, { $set: { accountVerification: accountVerification, otp: otp, otpExpiration: otpExpiration } }, { new: true, });
            if (updated) {
                return res.status(200).json({ message: "Otp send to your email.", status: 200, data: updated });
            }
            // } else {
            //     return res.status(200).json({ message: "Otp not send on your mail please check.", status: 200, data: {} });
            // }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error", error: err.message, });
    }
};
exports.forgotVerifyotp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        const user = await User.findOne({ email: req.body.email, userType: "LAWYER" });
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }
        if (user.otp !== otp || user.otpExpiration < Date.now()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
        let obj = { userId: updated._id, otp: updated.otp, }
        return res.status(200).send({ status: 200, message: "Verify otp successfully", data: obj });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ error: "internal server error" + err.message });
    }
};
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (user) {
            if (req.body.newPassword == req.body.confirmPassword) {
                const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword), accountVerification: true } }, { new: true });
                return res.status(200).send({ message: "Password update successfully.", data: updated, });
            } else {
                return res.status(501).send({ message: "Password Not matched.", data: {}, });
            }
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        // req.body.email = req.body.email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "LAWYER", });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "LAWYER";
            req.body.refferalCode = await reffralCode();
            if (req.files['barRegistrationImage']) {
                let barRegist = req.files['barRegistrationImage'];
                req.body.barRegistrationImage = barRegist[0].path;
            }
            if (req.files['barRegistrationImage']) {
                let barCert = req.files['barCertificateImage'];
                req.body.barCertificateImage = barCert[0].path;
            }
            if (req.files['aadhar']) {
                let aad = req.files['aadhar'];
                req.body.aadhar = aad[0].path;
            }
            const userCreate = await User.create(req.body);
            return res.status(200).send({ message: "registered successfully ", data: userCreate, });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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
        userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
        userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        userObj.accountVerification = false;
        const updated = await User.findOneAndUpdate({ phone: phone, userType: "LAWYER" }, { $set: userObj }, { new: true, }
        );
        return res.status(200).send({ userId: updated._id, otp: updated.otp });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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
        return res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
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
        return res.status(200).send({
            message: "logged in successfully",
            accessToken: accessToken,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ error: "internal server error" + err.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        console.log(req.user);
        const data = await User.findOne({ _id: req.user._id, }).populate({ path: 'categoryId', select: "name" });
        if (data) {
            const data1 = await rating.find({ lawyerId: data._id }).populate({ path: 'userId', select: "fullName firstName lastName image" });
            return res.status(200).json({ message: "get Profile", data: data, rating: data1 });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.resendOTP = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ id, userType: "LAWYER" });
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
        const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: { otp, otpExpiration, accountVerification } }, { new: true });
        return res.status(200).send({ message: "OTP resent", otp: otp });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.resetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email, userType: "LAWYER" });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        if (req.body.newPassword == req.body.confirmPassword) {
            const updated = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: bcrypt.hashSync(req.body.newPassword) } },
                { new: true }
            );
            return res.status(200).send({ message: "Password update successfully.", data: updated, });
        } else {
            return res.status(501).send({
                message: "Password Not matched.",
                data: {},
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { fullName, email, phone, password, bio, hearingFee, availability, languages, consultancyCost, lawyerStatus } = req.body;
        console.log("==================", req.body);
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        } else {
            fileUrl = user.image
        }
        let passwords;
        if (req.body.password) {
            passwords = bcrypt.hashSync(req.body.password, 8) || user.password;
        } else {
            password = user.password
        }
        let obj = {
            fullName: fullName || user.fullName,
            email: email || user.email,
            phone: phone || user.phone,
            image: fileUrl,
            bio: bio || user.bio,
            hearingFee: hearingFee || user.hearingFee,
            languages: languages || user.languages,
            password: passwords,
            availability: availability || user.availability,
            consultancyCost: consultancyCost || user.consultancyCost,
            lawyerStatus: lawyerStatus || user.lawyerStatus,
        }
        const updated = await User.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log("---------------", err);
        return res.status(500).send({ message: "internal server error " + err.message, });
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
        user.whatAppNotification = whatAppNotification || user.whatAppNotification;
        user.blogNotification = blogNotification || user.blogNotification;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        // console.log(updated);
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.skillExpertise = async (req, res) => {
    try {
        let findSkill = await User.findOne({ _id: req.user._id });
        if (findSkill) {
            return res.status(200).send({ msg: "skill data found", data: findSkill });
        } else {
            return res.status(404).send({ msg: "not found" });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.addskill = async (req, res) => {
    try {
        let findSkill = await User.findOne({ _id: req.user._id });
        if (findSkill) {
            let skill = [];
            for (let i = 0; i < findSkill.skills.length; i++) {
                let obj = {
                    skill: findSkill.skills[i].skill,
                };
                skill.push(obj);
            }
            let obj = {
                skill: req.body.skill,
            };
            skill.push(obj);
            const data = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { skills: skill } }, { new: true });
            return res.status(200).send({ msg: "skill added", data: data });
        } else {
            return res.status(404).send({ msg: "not found" });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.addExpertise = async (req, res) => {
    try {
        let findSkill = await User.findOne({ _id: req.user._id });
        if (findSkill) {
            let expertise = [];
            for (let i = 0; i < findSkill.expertises.length; i++) {
                let obj = {
                    expertise: findSkill.expertises[i].expertise,
                };
                expertise.push(obj);
            }
            let obj = {
                expertise: req.body.expertise,
            };
            expertise.push(obj);
            const data = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { expertises: expertise } }, { new: true });
            return res.status(200).send({ msg: "skill added", data: data });
        } else {
            return res.status(404).send({ msg: "not found" });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.createCase = async (req, res) => {
    try {
        req.body.lawyer = req.user._id;
        const result = await caseModel.create(req.body);
        if (result) {
            let findClient = await clientModel.findOne({ lawyer: req.user._id });
            if (findClient) {
                if (findClient.clients.includes((result.userId).toString())) {
                    return res.status(200).send({ msg: "Cases added", data: result });
                } else {
                    let update = await clientModel.findByIdAndUpdate({ _id: findClient._id }, { $push: { clients: (result.userId).toString() } }, { new: true })
                    return res.status(200).send({ msg: "Cases added", data: result });
                }
            } else {
                let obj = { lawyer: req.user._id };
                const result1 = await clientModel.create(obj);
                if (result1) {
                    let update = await clientModel.findByIdAndUpdate({ _id: result1._id }, { $push: { clients: (result.userId).toString() } }, { new: true })
                    return res.status(200).send({ msg: "Cases added", data: result });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
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
        return res.status(200).send({ msg: "updated", data: update });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.updateCaseStatus = async (req, res) => {
    try {
        const data = await caseModel.findById(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        if (data.status == "open") {
            const update = await caseModel.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: "closed" } }, { new: true, });
            if (update) {
                return res.status(200).send({ msg: "Case closed successfully.", data: update });
            }
        } else {
            const update = await caseModel.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: "open" } }, { new: true, });
            if (update) {
                return res.status(200).send({ msg: "Case open successfully", data: update });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getCase = async (req, res) => {
    try {
        const data = await caseModel.find({ lawyer: req.user._id }).populate('lawyer userId');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getIdCase = async (req, res) => {
    try {
        const data = await caseModel.findById(req.params.id).populate('lawyer userId notes');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.createAppointment = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.user._id });
        if (findUser) {
            let data = {
                lawyer: req.user._id,
                userId: req.body.userId,
                case: req.body.caseId,
                meetingId: await reffralCode(),
                appointmentDate: req.body.appointmentDate,
                appointmentType: req.body.appointmentType,
                appointmentTime: req.body.appointmentTime
            };
            const Data = await appointment.create(data);
            return res.status(200).json(Data);
        } else {
            return res.status(404).send({ message: "Document not found.", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.upcomingAppointment = async (req, res) => {
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
        const data = await appointment.find({ lawyer: req.user._id, appointmentDate: { $gte: text }, }).populate('lawyer userId case');
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "upcoming appointment not found", data: [], status: 404 });
        }
        return res.status(200).json({ message: "All upcoming appointment", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.allCancelAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ lawyer: req.user._id, appointmentStatus: "Cancel" }).populate('lawyer userId case');
        if (FindAppointment.length == 0) {
            return res.status(404).json({ message: "Cancel appointment not found", data: {}, status: 404 });
        } else {
            return res.status(200).json({ message: "All cancel Appointment", data: FindAppointment, status: 200 });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.pastAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ lawyer: req.user._id, appointmentStatus: "Done" }).populate('lawyer userId case');
        if (FindAppointment.length == 0) {
            return res.status(404).json({ message: "Past appointment not found", data: {}, status: 404 });
        } else {
            return res.status(200).json({ message: "All past appointment", data: FindAppointment });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.deleteCase = async (req, res) => {
    try {
        const data = await caseModel.findByIdAndDelete(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "deleted", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error",
            error: err.message,
        });
    }
};
exports.createBill = async (req, res) => {
    let findUser = await User.findById({ _id: req.params.userId });
    if (!findUser) {
        return res.status(400).send({ msg: "not found" });
    } else {
        req.body.lawyerId = req.user._id;
        req.body.customerId = findUser._id;
        const result = await billModel.create(req.body);
        return res.status(200).send({ msg: "bill added", data: result });
    }
};
exports.getAllbill = async (req, res) => {
    try {
        const data = await billModel.find({ lawyerId: req.user._id });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
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
        const data = await caseModel.find({ lawyer: req.user._id, hearingDate: { $gte: text }, }).populate('userId lawyer');
        if (!data || data.length === 0) {
            return res.status(400).send({ status: 404, msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getAllRating = async (req, res) => {
    try {
        console.log(req.user)
        const data = await rating.find({ lawyerId: req.user._id }).populate('userId');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getrefferalCode = async (req, res) => {
    try {
        const usersDocument = await User.findOne({ _id: req.user._id, });
        if (usersDocument) {
            return res.status(200).json({ message: "get Profile", data: usersDocument.refferalCode });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.getAllClient = async (req, res) => {
    try {
        const data = await clientModel.find({ lawyer: req.user._id }).populate('clients');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
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

exports.getCustomerWithFilter = async (req, res) => {
    try {
        const { search, location, rating } = req.query;
        let query = { userType: "CUSTOMER" };
        if (search) {
            query.$or = [
                { fullName: new RegExp(search, 'i') },
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
            ];
        }
        if (location) {
            query.$or = [
                { firstLineAddress: new RegExp(location, 'i') },
                { secondLineAddress: new RegExp(location, 'i') },
                { country: new RegExp(location, 'i') },
                { state: new RegExp(location, 'i') },
                { district: new RegExp(location, 'i') },
            ];
        }
        if (rating) {
            query.rating = { $gte: rating };
        }
        const findLawyer = await User.find(query);
        if (findLawyer.length === 0) {
            return res.status(404).send({ status: 404, message: "Lawyer not found.", data: [] });
        }
        return res.status(200).send({ status: 200, message: "Data found successfully.", data: findLawyer });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "server error while getting lawyer", error: err.message, });
    }
};