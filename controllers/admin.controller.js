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
const userModel = require("../models/user.model");
const Category = require("../models/category.model");
const Department = require("../models/department.model");
const Service = require("../models/service.model");
const Location = require("../models/location.model");
const banner = require('../models/banner.model');
const CourtCategory = require("../models/courtCategory.model");
const Court = require("../models/court.model");
exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({
            $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }],
        });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
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
        res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { name, email, phone, password, image } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = image || user.image;
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
exports.dashboard = async (req, res) => {
    try {
        let totalUser = await userModel.find({ userType: "CUSTOMER" }).count();
        let totalLawyer = await userModel.find({ userType: "LAWYER" }).count();
        let obj = {
            totalUser: totalUser,
            totalLawyer: totalLawyer,
        };
        res.status(200).send({ message: "Data found successfully", data: obj });
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
exports.getUsers = async (req, res) => {
    try {
        const findLawyer = await User.find({ userType: "CUSTOMER" });
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
exports.createCategory = async (req, res) => {
    try {
        const category = {
            userId: req.user._id,
            name: req.body.name,
            image: req.body.image,
        };
        const categoryCreated = await Category.create(category);
        console.log(
            `#### Category add successfully #### /n ${categoryCreated} `
        );
        res.status(201).send({
            message: "Category add successfully",
            data: categoryCreated,
        });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getCategory = async (req, res) => {
    try {
        const data = await Category.find().populate({
            path: "userId",
            select: "name",
        });
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
exports.getCategoryId = async (req, res) => {
    try {
        const data = await Category.findById(req.params.id);
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
exports.updateCategory = async (req, res) => {
    try {
        const data = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
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
exports.deleteCategory = async (req, res) => {
    try {
        const data = await Category.findByIdAndDelete(req.params.id);
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
exports.createDepartment = async (req, res) => {
    try {
        const department = {
            userId: req.user._id,
            name: req.body.name,
        };
        const departmentCreated = await Department.create(department);
        res.status(201).send({
            message: "Department add successfully",
            data: departmentCreated,
        });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getDepartment = async (req, res) => {
    try {
        const data = await Department.find().populate({
            path: "userId",
            select: "name",
        });
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
exports.getDepartmentId = async (req, res) => {
    try {
        const data = await Department.findById(req.params.id);
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
        res.status(200).send({ msg: "updated", data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.deleteDepartment = async (req, res) => {
    try {
        const data = await Department.findByIdAndDelete(req.params.id);
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
exports.createService = async (req, res) => {
    try {
        const service = { userId: req.user._id, name: req.body.name };
        const serviceCreated = await Service.create(service);
        res.status(201).send({
            message: "Service add successfully",
            data: serviceCreated,
        });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getService = async (req, res) => {
    try {
        const data = await Service.find().populate({
            path: "userId",
            select: "name",
        });
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
exports.getServiceId = async (req, res) => {
    try {
        const data = await Service.findById(req.params.id);
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
exports.updateService = async (req, res) => {
    try {
        const data = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
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
exports.deleteService = async (req, res) => {
    try {
        const data = await Service.findByIdAndDelete(req.params.id);
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
        res.status(201).send({
            message: "Location add successfully",
            data: locationCreated,
        });
    } catch (err) {
        console.log("#### error while Category create #### ", err.message);
        res.status(500).send({
            message: "Internal server error while creating category",
        });
    }
};
exports.getLocation = async (req, res) => {
    try {
        const data = await Location.find().populate({
            path: "userId",
            select: "name",
        });
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
exports.getLocationId = async (req, res) => {
    try {
        const data = await Location.findById(req.params.id);
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
exports.updateLocation = async (req, res) => {
    try {
        const data = await Location.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
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
exports.deleteLocation = async (req, res) => {
    try {
        const data = await Location.findByIdAndDelete(req.params.id);
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
exports.CreateLawyer = async (req, res) => {
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
exports.updateLawyer = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            bio,
            hearingFee,
            image,
            experiance,
            languages,
        } = req.body;
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
        res.status(500).send({
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
        res.status(200).send({ msg: "deleted", data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error",
            error: err.message,
        });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        const data = {
            image: req.body.image,
            desc: req.body.desc
        }
        const Data = await banner.create(data);
        res.status(200).json({
            message: "Banner is Addded ",
            data: Data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
};
exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find();
        res.status(200).json({
            message: "All Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
};
exports.getByIdBanner  = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        res.status(200).json({
            message: "One Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
};
exports.DeleteBanner = async(req,res) => {
    try{
        const Banner = await banner.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({
            message: "Delete Banner ",
        },)
    }catch(err){
        res.status(400).json({
            message: err.message
        })
    }
};
exports.createCourtCategory = async (req, res) => {
    try {
        const courtCategory = { name: req.body.name, type: "Court" };
        const courtCategoryCreated = await CourtCategory.create(courtCategory);
        res.status(201).send({
            message: "Court Category add successfully",
            data: courtCategoryCreated,
        });
    } catch (err) {
        console.log("#### error while Court Category create #### ", err.message);
        res.status(500).send({
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
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getCourtCategoryId = async (req, res) => {
    try {
        const data = await CourtCategory.findById({_id:req.params.id, type: "Court" });
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
exports.updateCourtCategory = async (req, res) => {
    try {
        req.body.type= "Court";
        const data = await CourtCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
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
exports.deleteCourtCategory = async (req, res) => {
    try {
        const data = await CourtCategory.findByIdAndDelete({_id:req.params.id, type: "Court" });
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
exports.createCaseCategory = async (req, res) => {
    try {
        const courtCategory = { name: req.body.name, type: "Case" };
        const courtCategoryCreated = await CourtCategory.create(courtCategory);
        res.status(201).send({
            message: "Court Category add successfully",
            data: courtCategoryCreated,
        });
    } catch (err) {
        console.log("#### error while Court Category create #### ", err.message);
        res.status(500).send({
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
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getCaseCategoryId = async (req, res) => {
    try {
        const data = await CourtCategory.findById({_id:req.params.id, type: "Case" });
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
exports.updateCaseCategory = async (req, res) => {
    try {
        req.body.type= "Case";
        const data = await CourtCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
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
exports.deleteCaseCategory = async (req, res) => {
    try {
        const data = await CourtCategory.findByIdAndDelete({_id:req.params.id, type: "Case" });
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
exports.createCase = async (req, res) => {
    try {
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
        } if (req.Params.caseStatus != (null || undefined)) {
            const data = await caseModel.find({ caseStatus: req.Params.caseStatus });
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
exports.createCourt = async (req, res) => {
    try {
        const court = { name: req.body.name, courtCategoryId: req.body.courtCategoryId };
        const courtCreated = await Court.create(court);
        res.status(201).send({message: "Court add successfully",data: courtCreated});
    } catch (err) {
        console.log("#### error while Court create #### ", err.message);
        res.status(500).send({
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
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.getCourtId = async (req, res) => {
    try {
        const data = await Court.findById({_id:req.params.id });
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
exports.updateCourt = async (req, res) => {
    try {
        const data = await Court.findByIdAndUpdate(req.params.id, req.body, {new: true});
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
exports.deleteCourt = async (req, res) => {
    try {
        const data = await Court.findByIdAndDelete({_id:req.params.id});
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