const userModel = require("../models/user.model");

exports.addMoney = async (req, res) => {
    if (!req.user._id) {
        return res.status(500).json({ message: "Provide Token " });
    }
    const findUser = await userModel.findOne({ user: req.user._id });
    if (!findUser) {
        res.status(400).json({ message: "User Not found. " });
    } else {
        findUser.wallet = parseInt(findUser.wallet) + parseInt(req.body.amount);
        const w = await findUser.save();
        res.status(200).json({
            status: "success",
            data: w.wallet,
        });
    }
};
exports.removeMoney = async (req, res) => {
    if (!req.user._id) {
        return res.status(500).json({
            message: "Provide Token ",
        });
    }
    const findUser = await userModel.findOne({ user: req.user._id });
    findUser.wallet = parseInt(findUser.wallet) - parseInt(req.body.amount);
    const w = await findUser.save();
    res.status(200).json({status: "success",data: w.wallet,});
};
exports.getWallet = async (req, res) => {
    try {
        if (!req.user._id) {
            return res.status(500).json({ message: "Provide Token " });
        }
        const wall = await userModel.findById({ _id: req.user._id });
        res.status(200).json({ status: "success", data: wall.wallet });
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};
