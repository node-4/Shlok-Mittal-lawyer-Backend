const User = require("../models/user.model");
const transaction = require('../models/transactionModel');
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.amount) } }, { new: true });
                        if (update) {
                                let obj;
                                if (req.body.id != (null || undefined)) {
                                        obj = {
                                                id: req.body.id,
                                                user: req.user.id,
                                                date: Date.now(),
                                                amount: req.body.amount,
                                                type: "Credit",
                                        };
                                } else {
                                        obj = {
                                                user: req.user.id,
                                                date: Date.now(),
                                                amount: req.body.amount,
                                                type: "Credit",
                                        };
                                }
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
                                let obj;
                                if (req.body.id != (null || undefined)) {
                                        obj = {
                                                id: req.body.id,
                                                user: req.user.id,
                                                date: Date.now(),
                                                amount: req.body.amount,
                                                type: "Debit",
                                        };
                                } else {
                                        obj = {
                                                user: req.user.id,
                                                date: Date.now(),
                                                amount: req.body.amount,
                                                type: "Debit",
                                        };
                                }
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
                const data = await transaction.find({ user: req.user.id }).populate("user user2");
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user.id, type: "Credit" }).populate("user user2");;
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user.id, type: "Debit" }).populate("user user2");;
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allTransaction = async (req, res) => {
        try {
                const data = await transaction.find({}).populate("user user2");
                if (data.length > 0) {
                        return res.status(200).json({ message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.withdrawApprove = async (req, res, next) => {
        try {
                console.log(req.params.id)
                let data = await transaction.findOne({ _id: req.params.id });
                if (!data) {
                        return res.status(404).send({ status: 404, message: "Data not found ", data: {} });
                } else {
                        if (data.status == "PAID") {
                                return res.status(409).send({ status: 409, message: "Already Paid ", data: {} });
                        } else {
                                if (req.body.status == "PAID") {
                                        if (req.file) {
                                                req.body.screenShot = req.file.path;
                                                let update = await transaction.findByIdAndUpdate({ _id: data._id }, { $set: req.body }, { new: true });
                                                if (update) {
                                                        let findUser = await User.findOne({ _id: data.userId });
                                                        let amount = (parseFloat(findUser.wallet) - parseFloat(update.amount)).toFixed(2)
                                                        await User.findByIdAndUpdate({ _id: data.userId }, { $set: { wallet: amount } }, { new: true });
                                                        return res.status(200).send({ status: 200, message: "Send money to driver successfully ", data: update });
                                                }
                                        }
                                } else if (req.body.status == "PENDING") {
                                        if (req.file) {
                                                req.body.screenShot = req.file.path;
                                                let update = await transaction.findByIdAndUpdate({ _id: data._id }, { $set: req.body }, { new: true });
                                                if (update) {
                                                        return res.status(200).send({ status: 200, message: "Send money to driver successfully ", data: update });
                                                }
                                        } else {
                                                let update = await transaction.findByIdAndUpdate({ _id: data._id }, { $set: req.body }, { new: true });
                                                if (update) {
                                                        return res.status(200).send({ status: 200, message: "Send money to driver successfully ", data: update });
                                                }
                                        }
                                } else {
                                        if (req.file) {
                                                req.body.screenShot = req.file.path;
                                                let update = await transaction.findByIdAndUpdate({ _id: data._id }, { $set: req.body }, { new: true });
                                                if (update) {
                                                        return res.status(200).send({ status: 200, message: "Send money to driver successfully ", data: update });
                                                }
                                        } else {
                                                let update = await transaction.findByIdAndUpdate({ _id: data._id }, { $set: req.body }, { new: true });
                                                if (update) {
                                                        return res.status(200).send({ status: 200, message: "Send money to driver successfully ", data: update });
                                                }
                                        }
                                }
                        }
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error, });
        }
};
exports.payNow = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        if (data.wallet >= req.body.amount) {
                                const dataReciver = await User.findOne({ _id: req.body.reciverId, });
                                if (dataReciver) {
                                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.amount) } }, { new: true });
                                        let update1 = await User.findByIdAndUpdate({ _id: dataReciver._id }, { $set: { wallet: data.wallet + parseInt(req.body.amount) } }, { new: true });
                                        if (update && update1) {
                                                let obj, obj1;
                                                if (req.body.id != (null || undefined)) {
                                                        obj = {
                                                                user: dataReciver._id,
                                                                id: req.body.id,
                                                                user2: data._id,
                                                                date: Date.now(),
                                                                message: "Money has been received by user ",
                                                                amount: req.body.amount,
                                                                type: "Credit",
                                                        };
                                                        obj1 = {
                                                                user: data._id,
                                                                id: req.body.id,
                                                                user2: dataReciver._id,
                                                                date: Date.now(),
                                                                message: "Money has been sent to lawyer ",
                                                                amount: req.body.amount,
                                                                type: "Debit",
                                                        };
                                                } else {
                                                        obj = {
                                                                user: dataReciver._id,
                                                                user2: data._id,
                                                                date: Date.now(),
                                                                message: "Money has been received by user ",
                                                                amount: req.body.amount,
                                                                type: "Credit",
                                                        };
                                                        obj1 = {
                                                                user: data._id,
                                                                user2: dataReciver._id,
                                                                date: Date.now(),
                                                                message: "Money has been sent to lawyer ",
                                                                amount: req.body.amount,
                                                                type: "Debit",
                                                        };
                                                }
                                                const transaction1 = await transaction.create(obj);
                                                const transaction2 = await transaction.create(obj1);
                                                if (transaction2 && transaction1) {
                                                        return res.status(200).json({ status: 200, message: "Money has been sent to lawyer.", data: transaction2, });
                                                }
                                        }
                                } else {
                                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "You have in sufficient balance", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.payNowForWebsite = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        if (data.wallet >= req.body.amount) {
                                const dataReciver = await User.findOne({ _id: req.body.reciverId, });
                                if (dataReciver) {
                                        let update1 = await User.findByIdAndUpdate({ _id: dataReciver._id }, { $set: { wallet: data.wallet + parseInt(req.body.amount) } }, { new: true });
                                        if (update1) {
                                                let obj, obj1;
                                                if (req.body.id != (null || undefined)) {
                                                        obj = {
                                                                user: dataReciver._id,
                                                                id: req.body.id,
                                                                user2: data._id,
                                                                date: Date.now(),
                                                                message: "Money has been received by user ",
                                                                amount: req.body.amount,
                                                                type: "Credit",
                                                        };
                                                        obj1 = {
                                                                user: data._id,
                                                                id: req.body.id,
                                                                user2: dataReciver._id,
                                                                date: Date.now(),
                                                                message: "Money has been sent to lawyer ",
                                                                amount: req.body.amount,
                                                                type: "Debit",
                                                        };
                                                } else {
                                                        obj = {
                                                                user: dataReciver._id,
                                                                user2: data._id,
                                                                date: Date.now(),
                                                                message: "Money has been received by user ",
                                                                amount: req.body.amount,
                                                                type: "Credit",
                                                        };
                                                        obj1 = {
                                                                user: data._id,
                                                                user2: dataReciver._id,
                                                                date: Date.now(),
                                                                message: "Money has been sent to lawyer ",
                                                                amount: req.body.amount,
                                                                type: "Debit",
                                                        };
                                                }
                                                const transaction1 = await transaction.create(obj);
                                                const transaction2 = await transaction.create(obj1);
                                                if (transaction2 && transaction1) {
                                                        return res.status(200).json({ status: 200, message: "Money has been sent to lawyer.", data: transaction2, });
                                                }
                                        }
                                } else {
                                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "You have in sufficient balance", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};