const httpError = require("http-errors");
const TermsAndConditions = require("../models/terms.model");

exports.getAllTerms = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.find({ type: "TERMS&CONDITION", });
        if (termsAndConditions.length === 0) {
            return res.status(400).send({ success: false, message: "Terms and conditions not found" });
        }
        return res.status(200).json({ status: 200, message: 'Terms and conditions found successfully.', data: termsAndConditions });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTermById = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: 'Terms and conditions found successfully.', data: termsAndConditions });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.createTerm = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            throw httpError(400, "Content is required");
        }
        const Obj = {
            type: "TERMS&CONDITION",
            content: content,
        };
        const termsAndConditions = await TermsAndConditions.create(Obj);
        return res.status(201).json(termsAndConditions);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateTerm = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            throw httpError(400, "Content is required");
        }
        const termsAndConditions = await TermsAndConditions.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        );
        if (!termsAndConditions) {
            throw httpError(404, "Terms and conditions not found");
        }
        res.json(termsAndConditions);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteTerm = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findByIdAndDelete(
            req.params.id
        );
        if (!termsAndConditions) {
            throw httpError(404, "Terms and conditions not found");
        }
        res.sendStatus(204);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAllPrivacyPolicy = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.find({
            type: "PRIVACY POLICY",
        });
        if (termsAndConditions.length === 0) {
            return res.status(400).send({ success: false, message: "Privacy and policy not found" });
        }
        res.json(termsAndConditions);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getPrivacyPolicyById = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(
            req.params.id
        );
        if (!termsAndConditions) {
            throw httpError(404, "Terms and conditions not found");
        }
        res.json(termsAndConditions);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.createPrivacyPolicy = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            throw httpError(400, "Content is required");
        }
        const Obj = { type: "PRIVACY POLICY", content: content, };
        const termsAndConditions = await TermsAndConditions.create(Obj);
        return res.status(201).json(termsAndConditions);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.updatePrivacyPolicy = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            throw httpError(400, "Content is required");
        }
        const termsAndConditions = await TermsAndConditions.findByIdAndUpdate(req.params.id, { content: content, type: "PRIVACY POLICY" }, { new: true });
        if (!termsAndConditions) {
            throw httpError(404, "Terms and conditions not found");
        }
        res.json(termsAndConditions);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.deletePrivacyPolicy = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        const termsAndConditions1 = await TermsAndConditions.findByIdAndDelete(req.params.id);
        if (termsAndConditions1) {
            return res.status(200).json({ status: 200, message: 'Terms and conditions Delete successfully.', data: termsAndConditions1 });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAllAboutUs = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.find({
            type: "ABOUTUS",
        });
        if (termsAndConditions.length === 0) {
            return res.status(400).send({ success: false, message: "AboutUs not found" });
        }
        return res.status(200).json({ status: 200, message: 'AboutUs found successfully.', data: termsAndConditions });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAboutUsById = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: 'AboutUs found successfully.', data: termsAndConditions });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.createAboutUs = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ status: 400, message: "No content provide", data: {} });
        }
        const Obj = {
            type: "ABOUTUS",
            content: content,
        };
        const termsAndConditions = await TermsAndConditions.create(Obj);
        return res.status(200).json({ status: 200, message: 'AboutUs create successfully.', data: termsAndConditions });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateAboutUs = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ status: 400, message: "No content provide", data: {} });
        }
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        const termsAndConditions1 = await TermsAndConditions.findByIdAndUpdate(req.params.id, { $set: content }, { new: true });
        if (termsAndConditions1) {
            return res.status(200).json({ status: 200, message: 'AboutUs update successfully.', data: termsAndConditions1 });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteAboutUs = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        const termsAndConditions1 = await TermsAndConditions.findByIdAndDelete(req.params.id);
        if (termsAndConditions1) {
            return res.status(200).json({ status: 200, message: 'AboutUs Delete successfully.', data: termsAndConditions1 });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.addDescriptionArrayInAboutUs = async (req, res) => {
    try {
        const { title, description } = req.body;
        let findBanner = await TermsAndConditions.findOne({ type: "ABOUTUS", });
        if (findBanner) {
            let image;
            if (req.file) {
                image = req.file.path
            }
            let data = {
                title: title,
                description: description,
                image: image
            }
            const newCategory = await TermsAndConditions.findByIdAndUpdate({ _id: findBanner._id }, { $push: { descriptionArray: data } }, { new: true });
            return res.status(200).json({ status: 200, message: 'AboutUs update successfully', data: newCategory });
        } else {
            let image;
            if (req.file) {
                image = req.file.path
            }
            const Obj = {
                type: "ABOUTUS",
                descriptionArray: [{
                    title: title,
                    description: description,
                    image: image,
                }]
            };
            const termsAndConditions = await TermsAndConditions.create(Obj);
            return res.status(200).json({ status: 200, message: 'AboutUs not found.', data: newCategory });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create faq' });
    }
};
exports.deleteDescriptionArrayInAboutUs = async (req, res) => {
    try {
        let findCart = await TermsAndConditions.findOne({ _id: req.params.id });
        if (findCart) {
            for (let i = 0; i < findCart.descriptionArray.length; i++) {
                if (findCart.descriptionArray.length > 1) {
                    if (((findCart.descriptionArray[i]._id).toString() == req.params.descriptionArrayId) == true) {
                        let updateCart = await TermsAndConditions.findByIdAndUpdate({ _id: findCart._id, 'descriptionArray._id': req.params.descriptionArrayId }, {
                            $pull: {
                                'descriptionArray':
                                {
                                    _id: req.params.descriptionArrayId,
                                    title: findCart.descriptionArray[i].title,
                                    description: findCart.descriptionArray[i].description,
                                    image: findCart.descriptionArray[i].image,
                                }
                            }
                        }, { new: true })
                        if (updateCart) {
                            return res.status(200).send({ message: "Description Array delete from AboutUs.", data: updateCart, });
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