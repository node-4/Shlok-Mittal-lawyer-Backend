const User = require("../models/user.model");
const transaction = require('../models/transactionModel');
exports.addMoney = async (req, res) => {
    try {
            const data = await User.findOne({ _id: req.user.id, });
            if (data) {
                    let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: wallet + parseInt(req.body.balance) } }, { new: true });
                    if (update) {
                            let obj = {
                                    user: req.user.id,
                                    date: Date.now(),
                                    amount: req.body.balance,
                                    type: "Credit",
                            };
                            const data1 = await transaction.create(obj);
                            if (data1) {
                                    res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                            }

                    }
            } else {
                    return res.status(404).json({ status: 404, message: "No data found", data: {} });
            }
    } catch (error) {
            console.log(error);
            res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.removeMoney = async (req, res) => {
    try {
            const data = await User.findOne({ _id: req.user.id, });
            if (data) {
                    let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.balance) } }, { new: true });
                    if (update) {
                            let obj = {
                                    user: req.user.id,
                                    date: Date.now(),
                                    amount: req.body.balance,
                                    type: "Debit",
                            };
                            const data1 = await transaction.create(obj);
                            if (data1) {
                                    res.status(200).json({ status: 200, message: "Money has been deducted.", data: update, });
                            }
                    }
            } else {
                    return res.status(404).json({ status: 404, message: "No data found", data: {} });
            }
    } catch (error) {
            console.log(error);
            res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
            res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.allTransactionUser = async (req, res) => {
    try {
            const data = await transaction.find({ user: req.user.id }).populate("user");
            res.status(200).json({ data: data });
    } catch (err) {
            res.status(400).json({ message: err.message });
    }
};
exports.allcreditTransactionUser = async (req, res) => {
    try {
            const data = await transaction.find({ user: req.user.id, type: "Credit" });
            res.status(200).json({ data: data });
    } catch (err) {
            res.status(400).json({ message: err.message });
    }
};
exports.allDebitTransactionUser = async (req, res) => {
    try {
            const data = await transaction.find({ user: req.user.id, type: "Debit" });
            res.status(200).json({ data: data });
    } catch (err) {
            res.status(400).json({ message: err.message });
    }
};