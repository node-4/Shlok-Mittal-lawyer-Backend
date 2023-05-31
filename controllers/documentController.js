const userDocuments = require("../models/document");

exports.AddDocument = async (req, res) => {
    try {
        const data = {
            userId: req.user.id,
            image: req.body.image,
            desc: req.body.desc,
        };
        const Data = await userDocuments.create(data);
        res.status(200).json({
            message: "Document is Addded ",
            data: Data,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getDocument = async (req, res) => {
    try {
        const FindDocument = await userDocuments.find({ userId: req.user.id });
        res.status(200).json({ message: "All Document", data: FindDocument });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getAllDocument = async (req, res) => {
    try {
        const FindDocument = await userDocuments.find({ });
        res.status(200).json({ message: "All Document", data: FindDocument });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getById = async (req, res) => {
    try {
        const findDocument = await userDocuments.findById({ _id: req.params.id });
        res.status(200).json({message: "Document found.",data: findDocument,});
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.DeleteDocument = async (req, res) => {
    try {
        const Document = await userDocuments.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({
            message: "Delete Document ",
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};
