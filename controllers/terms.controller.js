const httpError = require("http-errors");
const TermsAndConditions = require("../models/terms.model");

exports.getAllTerms = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.find({
            type: "TERMS&CONDITION",
        });
        if (termsAndConditions.length === 0) {
            return res.status(400).send({ success: false, message: "Terms and conditions not found" });
        }
        res.json(termsAndConditions);
    } catch (err) {
        next(httpError(500, err));
    }
};
exports.getTermById = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findById(req.params.id);
        if (!termsAndConditions) { throw httpError(404, "Terms and conditions not found"); }
        res.json(termsAndConditions);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
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
        next(httpError(500, err));
    }
};
exports.deletePrivacyPolicy = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findByIdAndDelete(req.params.id);
        if (!termsAndConditions) {
            throw httpError(404, "Terms and conditions not found");
        }
        res.sendStatus(204);
    } catch (err) {
        if (err.name === "CastError" && err.kind === "ObjectId") {
            return next(httpError(400, "Invalid terms and conditions ID"));
        }
        next(httpError(500, err));
    }
};
