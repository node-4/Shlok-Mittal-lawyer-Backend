const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const userDocuments = require("../models/document");
const saveDocuments = require("../models/saveDocument");
const caseModel = require("../models/cases.model");
const billModel = require("../models/bill.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const userModel = require("../models/user.model");
const Category = require("../models/category.model");
const Department = require("../models/department.model");
const Service = require("../models/service.model");
const Location = require("../models/location.model");
const banner = require('../models/banner.model');
const CourtCategory = require("../models/courtCategory.model");
const Court = require("../models/court.model");
const ContactDetail = require("../models/ContactDetail");
const appointment = require("../models/appointment.model");
const rating = require("../models/rating.model");

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        const data = await User.findOne({ email: req.body.email, userType: "ADMIN" });
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
        const user = await User.findOne({ email: req.body.email, userType: "ADMIN" });
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
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
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
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "ADMIN" });
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
exports.update = async (req, res) => {
    try {
        const { fullName, firstName, lastName, email, phone, password } = req.body;
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
        user.fullName = fullName || user.fullName;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = fileUrl;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        } else {
            user.password = user.password;
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
exports.dashboard = async (req, res) => {
    try {
        let totalUser = await userModel.find({ userType: "CUSTOMER" }).count();
        let oldUser = await userModel.find({ userType: "CUSTOMER" }).count();
        let newUser = await userModel.find({ userType: "CUSTOMER" }).count();
        let totalLawyer = await userModel.find({ userType: "LAWYER" }).count();
        let oldLawyer = await userModel.find({ userType: "LAWYER" }).count();
        let newLawyer = await userModel.find({ userType: "LAWYER" }).count();
        let totalDepartment = await Category.find().count();
        let oldDepartment = await Category.find().count();
        let newDepartment = await Category.find().count();
        let totalService = await Service.find().count();
        let oldService = await Service.find().count();
        let newService = await Service.find().count();
        let totalCases = await caseModel.find({}).count();
        let oldCases = await caseModel.find({}).count();
        let newCases = await caseModel.find({}).count();
        let totalBooking = await appointment.find({}).count();
        let oldBooking = await appointment.find({}).count();
        let newBooking = await appointment.find({}).count();
        let obj = {
            totalLawyer: totalLawyer,
            oldLawyer: oldLawyer,
            newLawyer: newLawyer,
            totalUser: totalUser,
            oldUser: oldUser,
            newUser: newUser,
            totalBooking: totalBooking,
            oldBooking: oldBooking,
            newBooking: newBooking,
            totalCases: totalCases,
            oldCases: oldCases,
            newCases: newCases,
            totalService: totalService,
            oldService: oldService,
            newService: newService,
            totalDepartment: totalDepartment,
            oldDepartment: oldDepartment,
            newDepartment: newDepartment,
        };
        return res.status(200).send({ message: "Data found successfully", data: obj });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.getLawyers = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "LAWYER" }).populate('categoryId');
        if (findLawyer.length === 0) {
            return res.status(404).json({ message: "Lawyer not found" });
        }
        return res.status(200).json({ status: 200, message: "Lawyer  found", data: findLawyer });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "server error while getting lawyer",
            error: err.message,
        });
    }
};
exports.CreateLawyer = async (req, res) => {
    const { phone, email } = req.body;
    try {
        let user = await User.findOne({ $and: [{ $or: [{ email: email }, { phone: phone }] }], userType: "LAWYER", });
        if (!user) {
            if (req.body.password) {
                req.body.password = bcrypt.hashSync(req.body.password, 8);
            }
            req.body.userType = "LAWYER";
            req.body.refferalCode = await reffralCode();
            if (req.files['barRegistrationImage']) {
                let barRegist = req.files['barRegistrationImage'];
                req.body.barRegistrationImage = barRegist[0].path;
            }
            if (req.files['barCertificateImage']) {
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
exports.updateLawyer = async (req, res) => {
    try {
        const { fullName, firstName, lastName, email, kyc, barCertificateNo, categoryId, barCertificate, firstLineAddress, secondLineAddress, country, state, district, pincode, phone, password, bio, hearingFee, image, experiance, languages, advoAssurance, paymentStructure } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.barCertificateNo = barCertificateNo || user.barCertificateNo;
        user.categoryId = categoryId || user.categoryId;
        user.barCertificate = barCertificate || user.barCertificate;
        user.firstLineAddress = firstLineAddress || user.firstLineAddress;
        user.secondLineAddress = secondLineAddress || user.secondLineAddress;
        user.country = country || user.country;
        user.state = state || user.state;
        user.district = district || user.district;
        user.pincode = pincode || user.pincode;
        user.fullName = fullName || user.fullName;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = image || user.image;
        user.bio = bio || user.bio;
        user.kyc = kyc || user.kyc;
        user.hearingFee = hearingFee || user.hearingFee;
        user.experiance = experiance || user.experiance;
        user.languages = languages || user.languages;
        user.paymentStructure = paymentStructure || user.paymentStructure;
        user.advoAssurance = advoAssurance || user.advoAssurance;
        if (req.files['barRegistrationImage']) {
            let barRegist = req.files['barRegistrationImage'];
            req.body.barRegistrationImage = barRegist[0].path;
        } else {
            req.body.barRegistrationImage = user.barRegistrationImage;
        }
        if (req.files['barCertificateImage']) {
            let barCert = req.files['barCertificateImage'];
            req.body.barCertificateImage = barCert[0].path;
        } else {
            req.body.barCertificateImage = user.barCertificateImage;
        }
        if (req.files['aadhar']) {
            let aad = req.files['aadhar'];
            req.body.aadhar = aad[0].path;
        } else {
            req.body.aadhar = user.aadhar;
        }
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
exports.deleteUser = async (req, res) => {
    try {
        const data = await User.findByIdAndDelete(req.params.id);
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
exports.getUserById = async (req, res) => {
    try {
        const data = await User.findById({ _id: req.params.id });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getUsers = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "CUSTOMER" });
        if (findLawyer.length === 0) {
            return res.status(404).json({ message: "user not found" });
        }
        return res.status(200).json({ status: 200, message: "user  found", data: findLawyer, });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "server error while getting lawyer",
            error: err.message,
        });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const { firstName, fullName, lastName, email, phone, kyc, whatAppNotification, image, blogNotification, firstLineAddress, secondLineAddress, country, state, pincode, district } = req.body;
        const user = await User.findById({ _id: req.params.id });
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }
        let password;
        if (req.body.password) {
            password = bcrypt.hashSync(req.body.password, 8)
        }
        let obj = {
            fullName: fullName || user.fullName,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            email: email || user.email,
            phone: phone || user.phone,
            image: fileUrl || user.image,
            kyc: kyc || user.kyc,
            whatAppNotification: whatAppNotification || user.whatAppNotification,
            blogNotification: blogNotification || user.blogNotification,
            password: password || user.password,
            firstLineAddress: firstLineAddress || user.firstLineAddress,
            secondLineAddress: secondLineAddress || user.secondLineAddress,
            country: country || user.country,
            state: state || user.state,
            district: district || user.district,
            pincode: pincode || user.pincode,
        }
        console.log(obj);
        let updated = await User.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true })
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "internal server error " + err.message, });
    }
};
exports.createCase = async (req, res) => {
    try {
        const result = await caseModel.create(req.body);
        return res.status(200).send({ msg: "Cases added", data: result });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.updateCase = async (req, res) => {
    try {
        const data = await caseModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, });
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getCase = async (req, res) => {
    try {
        if (req.query.lawyer != (null || undefined)) {
            const data = await caseModel.find({ lawyer: req.query.lawyer }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } if (req.query.caseStatus != (null || undefined)) {
            const data = await caseModel.find({ caseStatus: req.query.caseStatus }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } else {
            const data = await caseModel.find().populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getNewCase = async (req, res) => {
    try {
        if (req.query.lawyer != (null || undefined)) {
            const data = await caseModel.find({ lawyer: req.query.lawyer }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } if (req.query.caseStatus != (null || undefined)) {
            const data = await caseModel.find({ caseStatus: req.query.caseStatus }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } else {
            const data = await caseModel.find().populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getOldCase = async (req, res) => {
    try {
        if (req.query.lawyer != (null || undefined)) {
            const data = await caseModel.find({ lawyer: req.query.lawyer }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } if (req.query.caseStatus != (null || undefined)) {
            const data = await caseModel.find({ caseStatus: req.query.caseStatus }).populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        } else {
            const data = await caseModel.find().populate('lawyer userId notes');
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ data: data });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getClosedCase = async (req, res) => {
    try {
        const data = await caseModel.find({ status: "closed" }).populate('lawyer userId notes');
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
exports.createDepartment = async (req, res) => {
    try {
        const department = {
            userId: req.user._id,
            name: req.body.name,
        };
        const departmentCreated = await Department.create(department);
        return res.status(201).send({ message: "Department add successfully", data: departmentCreated, });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getDepartment = async (req, res) => {
    try {
        const data = await Department.find().populate({ path: "userId", select: "name", });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getDepartmentId = async (req, res) => {
    try {
        const data = await Department.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateDepartment = async (req, res) => {
    try {
        const data = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteDepartment = async (req, res) => {
    try {
        const data = await Department.findByIdAndDelete(req.params.id);
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
exports.createCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ name: req.body.name });
        if (findCategory) {
            return res.status(409).json({ message: "Category already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = {
                name: req.body.name,
                image: fileUrl,
                type: req.body.type,
                category: req.body.category,
                info: req.body.info,
                document: req.body.document,
                payment: req.body.payment,
            };
            const category = await Category.create(data);
            return res.status(200).json({ message: "Category add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    category.image = fileUrl || category.image;
    category.name = req.body.name || category.name;
    category.type = req.body.type || category.type;
    category.category = req.body.category || category.category;
    category.info = req.body.info || category.info;
    category.document = req.body.document || category.document;
    category.payment = req.body.payment || category.payment;
    category.advoAssurance = req.body.advoAssurance || category.advoAssurance;
    let update = await category.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.getCategory = async (req, res) => {
    try {
        if (req.query.type) {
            const data = await Category.find({ type: req.query.type });
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ status: 200, message: "Data found", data: data });
        } else {
            const data = await Category.find();
            if (!data || data.length === 0) {
                return res.status(400).send({ msg: "not found" });
            }
            return res.status(200).send({ status: 200, message: "Data found", data: data });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getCategoryId = async (req, res) => {
    try {
        const data = await Category.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        const findLawyer = await User.find({ categoryId: { $in: data._id }, userType: "LAWYER" }).populate('categoryId');
        const allData = await rating.find({ categoryId: { $in: data._id } }).populate('userId lawyerId');
        return res.status(200).send({ data: data, rating: allData, lawyer: findLawyer });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteCategory = async (req, res) => {
    try {
        const data = await Category.findByIdAndDelete(req.params.id);
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
exports.addFaqInCategory = async (req, res) => {
    try {
        const { answer, question } = req.body;
        const findBanner = await Category.findOne({ _id: req.params.id });
        if (findBanner) {
            let data = {
                answer: answer,
                question: question,
            }
            const newCategory = await Category.findByIdAndUpdate({ _id: findBanner._id }, { $push: { faqs: data } }, { new: true });
            return res.status(200).json({ status: 200, message: 'Category faqs update successfully', data: newCategory });
        } else {
            return res.status(200).json({ status: 200, message: 'Category faqs not found.', data: newCategory });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create faq' });
    }
};
exports.deleteFaqsInCategoryFAQ = async (req, res) => {
    try {
        const findCart = await Category.findOne({ _id: req.params.id });
        if (findCart) {
            for (let i = 0; i < findCart.faqs.length; i++) {
                if (findCart.faqs.length > 1) {
                    if (((findCart.faqs[i]._id).toString() == req.params.faqsId) == true) {
                        let updateCart = await Category.findByIdAndUpdate({ _id: findCart._id, 'faqs._id': req.params.faqsId }, {
                            $pull: {
                                'faqs':
                                {
                                    _id: req.params.faqsId,
                                    question: findCart.faqs[i].question,
                                    answer: findCart.faqs[i].answer,
                                }
                            }
                        }, { new: true })
                        if (updateCart) {
                            return res.status(200).send({ message: "Description Array delete from Blog.", data: updateCart, });
                        }
                    }
                } else {
                    return res.status(200).send({ status: 200, message: "No Data Found ", data: [] });
                }
            }
        } else {
            return res.status(200).send({ status: 200, message: "No Data Found ", cart: [] });
        }
    } catch (error) {
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.addAdvoAssuranceInCategory = async (req, res) => {
    try {
        const { title, description } = req.body;
        const findBanner = await Category.findOne({ _id: req.params.id });
        if (findBanner) {
            if (req.file) {
                image = req.file ? req.file.path : "";
            } else {
                return res.status(404).json({ status: 404, message: 'advoAssurance image not found.', data: {} });
            }
            let data = {
                image: image,
                title: title,
                description: description,
            }
            const newCategory = await Category.findByIdAndUpdate({ _id: findBanner._id }, { $push: { advoAssurance: data } }, { new: true });
            return res.status(200).json({ status: 200, message: 'Category faqs update successfully', data: newCategory });
        } else {
            return res.status(200).json({ status: 200, message: 'Category faqs not found.', data: newCategory });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create faq' });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }
        const data = {
            image: fileUrl,
            desc: req.body.desc,
            date: req.body.date,
            title: req.body.title,
            link: req.body.link
        }
        const Data = await banner.create(data);
        return res.status(200).json({
            message: "Banner is Addded ",
            data: Data
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
};
exports.updateBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (Banner) {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            } else {
                fileUrl = Banner.image
            }
            const data = {
                image: fileUrl,
                desc: req.body.desc || Banner.desc,
                date: req.body.date || Banner.date,
                title: req.body.title || Banner.title,
                link: req.body.link || Banner.link,
            }
            let update = await banner.findByIdAndUpdate({ _id: Banner._id }, { $set: data }, { new: true, });
            return res.status(200).json({ message: "Banner is update ", data: update })
        } else {
            return res.status(404).json({ message: "Banner Not Found", status: 404, data: {} })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
};
exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find();
        return res.status(200).json({
            message: "All Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
};
exports.getByIdBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        return res.status(200).json({
            message: "One Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
};
exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({
            message: "Delete Banner ",
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
};
exports.createCourtCategory = async (req, res) => {
    try {
        const courtCategory = { name: req.body.name, type: "Court" };
        const courtCategoryCreated = await CourtCategory.create(courtCategory);
        return res.status(201).send({
            message: "Court Category add successfully",
            data: courtCategoryCreated,
        });
    } catch (err) {
        console.log("#### error while Court Category create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating Court Category",
        });
    }
};
exports.getCourtCategory = async (req, res) => {
    try {
        const data = await CourtCategory.find({ type: "Court" });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getCourtCategoryId = async (req, res) => {
    try {
        const data = await CourtCategory.findById({ _id: req.params.id, type: "Court" });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateCourtCategory = async (req, res) => {
    try {
        req.body.type = "Court";
        const data = await CourtCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteCourtCategory = async (req, res) => {
    try {
        const data = await CourtCategory.findByIdAndDelete({ _id: req.params.id, type: "Court" });
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
exports.createCaseCategory = async (req, res) => {
    try {
        const courtCategory = { name: req.body.name, type: "Case" };
        const courtCategoryCreated = await CourtCategory.create(courtCategory);
        return res.status(201).send({
            message: "Court Category add successfully",
            data: courtCategoryCreated,
        });
    } catch (err) {
        console.log("#### error while Court Category create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating Court Category",
        });
    }
};
exports.getCaseCategory = async (req, res) => {
    try {
        const data = await CourtCategory.find({ type: "Case" });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getCaseCategoryId = async (req, res) => {
    try {
        const data = await CourtCategory.findById({ _id: req.params.id, type: "Case" });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateCaseCategory = async (req, res) => {
    try {
        req.body.type = "Case";
        const data = await CourtCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteCaseCategory = async (req, res) => {
    try {
        const data = await CourtCategory.findByIdAndDelete({ _id: req.params.id, type: "Case" });
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
exports.createCourt = async (req, res) => {
    try {
        const court = { name: req.body.name, courtCategoryId: req.body.courtCategoryId };
        const courtCreated = await Court.create(court);
        return res.status(201).send({ message: "Court add successfully", data: courtCreated });
    } catch (err) {
        console.log("#### error while Court create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating Court",
        });
    }
};
exports.getCourt = async (req, res) => {
    try {
        const data = await Court.find();
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getCourtId = async (req, res) => {
    try {
        const data = await Court.findById({ _id: req.params.id });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateCourt = async (req, res) => {
    try {
        const data = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteCourt = async (req, res) => {
    try {
        const data = await Court.findByIdAndDelete({ _id: req.params.id });
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
exports.createLocation = async (req, res) => {
    try {
        const location = {
            userId: req.user._id,
            address: req.body.name,
            state: req.body.state,
            distract: req.body.distract,
            code: req.body.code,
        };
        const locationCreated = await Location.create(location);
        return res.status(201).send({
            message: "Location add successfully",
            data: locationCreated,
        });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getLocation = async (req, res) => {
    try {
        const data = await Location.find({}).populate({ path: "userId", select: "lastName firstName fullName", });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getLocationByUser = async (req, res) => {
    try {
        const data = await Location.find({ userId: req.user._id }).populate({ path: "userId", select: "lastName firstName fullName", });
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getLocationId = async (req, res) => {
    try {
        const data = await Location.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateLocation = async (req, res) => {
    try {
        const data = await Location.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteLocation = async (req, res) => {
    try {
        const data = await Location.findByIdAndDelete(req.params.id);
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
exports.addContactDetails = async (req, res) => {
    try {
        let findContact = await ContactDetail.findOne();
        if (findContact) {
            req.body.mobileNumber = req.body.mobileNumber || findContact.mobileNumber;
            req.body.mobileNumberDescription = req.body.mobileNumberDescription || findContact.mobileNumberDescription;
            req.body.email = req.body.email || findContact.email;
            req.body.emailDescription = req.body.emailDescription || findContact.emailDescription;
            req.body.whatAppchat = req.body.whatAppchat || findContact.whatAppchat;
            req.body.whatAppchatDescription = req.body.whatAppchatDescription || findContact.whatAppchatDescription;
            let updateContact = await ContactDetail.findByIdAndUpdate({ _id: findContact._id }, { $set: req.body }, { new: true });
            if (updateContact) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: updateContact });
            }
        } else {
            let result2 = await ContactDetail.create(req.body);
            if (result2) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: result2 });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.viewContactDetails = async (req, res) => {
    try {
        let findcontactDetails = await ContactDetail.findOne();
        if (!findcontactDetails) {
            return res.status(404).send({ status: 404, message: "Contact Detail not found.", data: {} });
        } else {
            return res.status(200).send({ status: 200, message: "Contact Detail fetch successfully", data: findcontactDetails });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.upcomingAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ appointmentStatus: "Pending" }).populate('lawyer userId case');
        return res.status(200).json({ message: "All upcoming appointment", data: FindAppointment });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message, });
    }
};
exports.allCancelAppointment = async (req, res) => {
    try {
        const FindAppointment = await appointment.find({ appointmentStatus: "Cancel" }).populate('lawyer userId case');
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
        const FindAppointment = await appointment.find({ appointmentStatus: "Done" }).populate('lawyer userId case');
        return res.status(200).json({ message: "All Document", data: FindAppointment });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getSaveDocument = async (req, res) => {
    try {
        const usersDocument = await saveDocuments.find({}).populate({ path: 'documents', populate: { path: 'id' } });
        if (usersDocument.length === 0) {
            return res.status(404).json({ message: "save Document not found" });
        }
        return res.status(200).json(usersDocument);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "server error while getting lawyer", error: err.message, });
    }
}
exports.createService = async (req, res) => {
    try {
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }
        const data = {
            name: req.body.name,
            image: fileUrl,
            type: req.body.type,
            category: req.body.category,
            info: req.body.info,
        };
        const serviceCreated = await Service.create(data);
        return res.status(201).send({ message: "Service add successfully", data: serviceCreated, });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        return res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getService = async (req, res) => {
    try {
        const data = await Service.find();
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.getServiceId = async (req, res) => {
    try {
        const data = await Service.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Service.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        category.type = req.body.type || category.type;
        category.category = req.body.category || category.category;
        category.info = req.body.info || category.info;
        let update = await category.save();
        return res.status(200).send({ msg: "updated", data: update });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: message,
        })
    }
};
exports.deleteService = async (req, res) => {
    try {
        const data = await Service.findByIdAndDelete(req.params.id);
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

exports.CreateStaff = async (req, res) => {
    const { phone, email } = req.body;
    try {
        let user = await User.findOne({ $and: [{ $or: [{ email: email }, { phone: phone }] }], userType: "STAFF", });
        if (!user) {
            if (req.body.password) {
                req.body.password = bcrypt.hashSync(req.body.password, 8);
            } else {
                let pass = '12345678';
                req.body.password = bcrypt.hashSync(pass, 8);
            }
            req.body.userType = "STAFF";
            req.body.refferalCode = await reffralCode();
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
exports.getStaff = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "STAFF" })
        if (findLawyer.length === 0) {
            return res.status(404).json({ message: "Staff not found" });
        }
        return res.status(200).json({ status: 200, message: "Staff  found", data: findLawyer });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "server error while getting Staff", error: err.message, });
    }
};
exports.updateStaff = async (req, res) => {
    try {
        const data = await User.findById(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "Staff not found" });
        } else {
            data.fullName = req.body.fullName || data.fullName;
            data.email = req.body.email || data.email;
            data.phone = req.body.phone || data.phone;
            data.permission = req.body.permission || data.permission;
            data.status = req.body.status || data.status;
            if (req.body.password) {
                data.password = bcrypt.hashSync(req.body.password, 8);
            } else {
                data.password = data.password;
            }
            const updated = await data.save();
            return res.status(200).json({ status: 200, message: "Staff  updated successfully", data: updated });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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
