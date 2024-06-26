const userDocuments = require("../models/document");
const caseModel = require("../models/cases.model");
const saveDocuments = require("../models/saveDocument");

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
            const Data1 = await userDocuments.create(data);
            if (Data1) {
                const usersDocument = await saveDocuments.findOne({ userId: cases.userId, });
                if (usersDocument) {
                    let documents = [];
                    let obj = { id: Data1._id };
                    documents.push(obj);
                    for (let i = 0; i < usersDocument.documents.length; i++) {
                        documents.push(usersDocument.documents[i]);
                    }
                    let update = await saveDocuments.findByIdAndUpdate({ _id: usersDocument._id }, { $set: { documents: documents } }, { new: true });
                    let update1 = await caseModel.findByIdAndUpdate({ _id: cases._id }, { $push: { notes: Data1._id } }, { new: true });
                    if (update1) {
                        return res.status(200).json({ message: "Document is Addded ", data: Data1, });
                    }
                } else {
                    let documents = [];
                    let obj = { id: Data1._id };
                    documents.push(obj);
                    const data = { userId: cases.userId, documents: documents };
                    const usersDocument = await saveDocuments.create(data);
                    let update = await caseModel.findByIdAndUpdate({ _id: cases._id }, { $push: { notes: Data1._id } }, { new: true });
                    if (update) {
                        return res.status(200).json({ message: "Document is Addded ", data: Data, });
                    }
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
