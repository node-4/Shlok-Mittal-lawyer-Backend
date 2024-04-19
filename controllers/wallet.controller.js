const User = require("../models/user.model");
const transaction = require('../models/transactionModel');
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.amount) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user.id,
                                        date: Date.now(),
                                        amount: req.body.amount,
                                        type: "Credit",
                                };
                                const data1 = await transaction.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                                }

                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.amount) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user.id,
                                        date: Date.now(),
                                        amount: req.body.amount,
                                        type: "Debit",
                                };
                                const data1 = await transaction.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been deducted.", data: update, });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data.wallet });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.allTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user.id }).populate("user");
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user.id, type: "Credit" });
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user.id, type: "Debit" });
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allTransaction = async (req, res) => {
        try {
                const data = await transaction.find({}).populate("user");
                if (data.length > 0) {
                        return res.status(200).json({ message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};