const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const appointment = require("../models/appointment.model");
const rating = require("../models/rating.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const userModel = require("../models/user.model");
const caseModel = require("../models/cases.model");
const clientModel = require("../models/clientModel");
const feedback = require("../models/feedback");
exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        const data = await User.findOne({ email: req.body.email, userType: "CUSTOMER" });
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
        const user = await User.findOne({ email: req.body.email, userType: "CUSTOMER" });
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
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }, { userType: "CUSTOMER" }], });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "CUSTOMER";
            req.body.refferalCode = await reffralCode();
            console.log(req.body);
            const userCreate = await User.create(req.body);
            return res.status(200).send({
                message: "registered successfully ",
                data: userCreate,
            });
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
        const updated = await User.findOneAndUpdate({ phone: phone, userType: "CUSTOMER" }, userObj, {
            new: true,
        });
        return res.status(200).send({ userId: updated._id, otp: updated.otp });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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
        return res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const usersDocument = await userModel.findOne({ _id: req.user._id, });
        if (usersDocument) {
            return res.status(200).json({ message: "get Profile", data: usersDocument });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        return res.status(501).send({ message: "server error.", data: {}, });
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
        const updated = await User.findByIdAndUpdate({ _id: user._id }, userObj, { new: true });
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
        return res.status(200).send({ message: "OTP resent", otp: otp });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
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
            return res.status(200).send({
                message: "Password update successfully.",
                data: updated,
            });
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
        const { firstName, lastName, email, phone, kyc, whatAppNotification, image, blogNotification } = req.body;
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
        let password;
        if (req.body.password) {
            password = bcrypt.hashSync(req.body.password, 8)
        } else {
            password = user.password
        }
        let obj = {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            email: email || user.email,
            phone: phone || user.phone,
            image: fileUrl,
            kyc: kyc || user.kyc,
            whatAppNotification: whatAppNotification || user.whatAppNotification,
            blogNotification: blogNotification || user.blogNotification,
            password: password,
        }
        console.log(obj);
        let updated = await User.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true })
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
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
exports.getLawyersbyCategory = async (req, res) => {
    try {
        const findLawyer = await User.find({ categoryId: req.params.categoryId, userType: "LAWYER" }).populate('categoryId');
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
        const findDocument = await userDocuments.findById({ _id: req.params.id, });
        if (!findDocument) {
            return res.status(404).send({ message: "Document not found.", data: {} });
        } else {
            const usersDocument = await saveDocuments.findOne({ userId: req.user._id, });
            if (usersDocument) {
                let documents = [];
                let obj = { id: findDocument._id };
                documents.push(obj);
                for (let i = 0; i < usersDocument.documents.length; i++) {
                    documents.push(usersDocument.documents[i]);
                }
                let update = await saveDocuments.findByIdAndUpdate({ _id: usersDocument._id }, { $set: { documents: documents } }, { new: true });
                return res.status(200).json({ message: "updated", data: update });
            } else {
                let documents = [];
                let obj = { id: findDocument._id };
                documents.push(obj);
                const data = { userId: req.user._id, documents: documents };
                const Data = await saveDocuments.create(data);
                return res.status(200).json(Data);
            }
        }
    } catch (error) {
        return res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.getSaveDocument = async (req, res) => {
    try {
        const usersDocument = await saveDocuments.find({ userId: req.user._id }).populate('documents.id');
        if (usersDocument.length === 0) {
            return res.status(404).json({ message: "save Document not found" });
        }
        return res.status(200).json(usersDocument);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "server error while getting lawyer",
            error: err.message,
        });
    }
};
exports.createAppointment = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.user._id });
        if (findUser) {
            let data = {
                lawyer: req.body.lawyerId,
                userId: req.user._id,
                case: req.body.caseId,
                appointmentDate: req.body.appointmentDate,
                appointmentType: req.body.appointmentType,
                appointmentTime: req.body.appointmentTime,
                callType: "BOOKING"
            };
            const Data = await appointment.create(data);
            return res.status(200).json(Data);
        } else {
            return res.status(404).send({ message: "Document not found.", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.instantAppointment = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.user._id });
        if (findUser) {
            let lawyers = [];
            let hrs = new Date(Date.now()).getHours();
            let min = new Date(Date.now()).getMinutes();
            let hrs1, mins;
            if (hrs < 10) {
                hrs1 = '' + 0 + hrs;
            } else {
                hrs1 = hrs;
            }
            if (min < 10) {
                mins = '' + 0 + min;
            } else {
                mins = min;
            }
            const findLawyer = await User.find({ userType: "LAWYER" });
            if (findLawyer.length === 0) {
                return res.status(404).json({ message: "Lawyer not found" });
            } else {
                for (let i = 0; i < findLawyer.length; i++) {
                    lawyers.push(findLawyer[i]._id)
                }
            }
            let data = {
                userId: req.user._id,
                appointmentType: req.body.appointmentType,
                appointmentTime: `${hrs1}:${mins}`,
                callType: "INSTANT",
                joinStatus: "Pending",
                lawyers: lawyers
            };
            const Data = await appointment.create(data);
            if (Data) {
                let update = await appointment.findByIdAndUpdate({ _id: Data._id }, { $set: { appointmentDate: Data.createdAt } }, { new: true })
                return res.status(200).json(update);
            }
        } else {
            return res.status(404).send({ message: "Document not found.", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.cancelAppointment = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.user._id });
        if (findUser) {
            const FindAppointment = await appointment.findById({ _id: req.params.id });
            if (FindAppointment) {
                const Data = await appointment.findByIdAndUpdate({ _id: FindAppointment._id }, { $set: { appointmentStatus: "Cancel" } }, { new: true });
                return res.status(200).json({ message: "Cancel appointment", data: Data });
            }
        } else {
            return res.status(404).send({ message: "appointment not found.", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.appointmentFeedback = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.user._id });
        if (findUser) {
            const FindAppointment = await appointment.findById({ _id: req.params.id });
            if (FindAppointment) {
                const Data = await appointment.findByIdAndUpdate({ _id: FindAppointment._id }, { $set: { youfeel: req.body.youfeel, subject: req.body.subject, message: req.body.message, } }, { new: true });
                return res.status(200).json({ message: "Appointment Feedback", data: Data });
            }
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
        const FindAppointment = await appointment.find({ userId: req.user._id, appointmentStatus: "Pending" }).populate('lawyer case userId');
        return res.status(200).json({ message: "All upcoming appointment", data: FindAppointment });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message, });
    }
};
exports.allCancelAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ userId: req.user._id, appointmentStatus: "Cancel" }).populate('lawyer case userId');
        return res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.pastAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ userId: req.user._id, appointmentStatus: "Done" }).populate('lawyer case userId');
        return res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getAllbill = async (req, res) => {
    try {
        const data = await billModel.find({ customerId: req.user._id });
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
exports.giveRating = async (req, res) => {
    try {
        const findUser = await User.findById({ _id: req.params.id });
        if (findUser) {
            let data = {
                userId: req.user._id,
                lawyerId: req.params.id,
                rating: req.body.rating,
                comment: req.body.comment,
                subject: req.body.subject,
                date: Date.now(),
            };
            const Data = await rating.create(data);
            const allData = await rating.find({ lawyerId: req.params.id }).populate('userId');
            if (!allData || allData.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            let avg = 0;
            allData.forEach((rev) => {
                avg += rev.rating;
            });

            let ratings = avg / allData.length;
            await User.findByIdAndUpdate({ _id: findUser._id }, { $set: { rating: ratings } }, { new: true });
            return res.status(200).json(Data);
        } else {
            return res.status(404).send({ message: "Document not found.", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({
            message: "server error.",
            data: {},
        });
    }
};
exports.getCase = async (req, res) => {
    try {
        const data = await caseModel.find({ userId: req.user._id }).populate('lawyer userId');
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
        const usersDocument = await userModel.findOne({ _id: req.user._id, });
        if (usersDocument) {
            return res.status(200).json({ message: "get Profile", data: usersDocument.refferalCode });
        } else {
            return res.status(404).json({ message: "No data found", data: {} });
        }
    } catch (error) {
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.getAllLawyer = async (req, res) => {
    try {
        const data = await clientModel.find({ clients: { $in: req.user._id } }).populate('lawyer');
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
exports.allRating = async (req, res) => {
    try {
        const allData = await rating.find({}).populate('userId lawyerId');
        if (!allData || allData.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ status: 200, message: "Data found successfully.", data: allData });
    } catch (error) {
        console.log(error);
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.allRatingLawyer = async (req, res) => {
    try {
        const allData = await rating.find({ lawyerId: req.params.lawyerId }).populate('userId lawyerId');
        if (!allData || allData.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ status: 200, message: "Data found successfully.", data: allData });
    } catch (error) {
        console.log(error);
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};
exports.getLawyersbyRating = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "LAWYER", rating: { $gte: req.params.rating } });
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
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}
exports.getLawyersWithFilter = async (req, res) => {
    try {
        const { search, location, rating } = req.query;
        let query = { userType: "LAWYER" };
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

exports.AddFeedback = async (req, res) => {
    try {
        const { Feedback, rating } = req.body;
        let obj = {
            userId: req.user._id,
            Feedback: Feedback,
            rating: rating
        }
        const data = await feedback.create(obj);
        return res.status(200).json({ details: data })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
};
exports.allFeedback = async (req, res) => {
    try {
        const allData = await feedback.find({}).populate('userId');
        if (!allData || allData.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ status: 200, message: "Data found successfully.", data: allData });
    } catch (error) {
        console.log(error);
        return res.status(501).send({ message: "server error.", data: {}, });
    }
};