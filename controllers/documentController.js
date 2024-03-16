const userDocuments = require("../models/document");
const caseModel = require("../models/cases.model");

exports.AddDocument = async (req, res) => {
    try {
        console.log(req.body.caseId);
        const cases = await caseModel.findById({ _id: req.body.caseId });
        if (cases) {
            let image = null;
            if (req.file) {
                image = req.file.path
            }
            const data = { casesId: cases._id, userId: cases.userId, lawyerId: cases.lawyer, image: image, desc: req.body.desc, };
            const Data = await userDocuments.create(data);
            if (Data) {
                let update = await caseModel.findByIdAndUpdate({ _id: cases._id }, { $push: { notes: Data._id } }, { new: true });
                if (update) {
                    return res.status(200).json({ message: "Document is Addded ", data: Data, });
                }
            }
        } else {
            return res.status(404).json({ message: "Case not found", data: {} });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getDocument = async (req, res) => {
    try {
        const FindDocument = await userDocuments.find({ $and: [{ $or: [{ userId: req.user.id }, { lawyerId: req.user.id }] }] });
        return res.status(200).json({ message: "All Document", data: FindDocument });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getBycaseId = async (req, res) => {
    try {
        const findDocument = await userDocuments.find({ casesId: req.params.caseId });
        return res.status(200).json({ message: "Document found.", data: findDocument, });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getById = async (req, res) => {
    try {
        const findDocument = await userDocuments.findById({ _id: req.params.id });
        return res.status(200).json({ message: "Document found.", data: findDocument, });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.getAllDocument = async (req, res) => {
    try {
        const FindDocument = await userDocuments.find({});
        return res.status(200).json({ message: "All Document", data: FindDocument });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.DeleteDocument = async (req, res) => {
    try {
        const Document = await userDocuments.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({
            message: "Delete Document ",
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
};
