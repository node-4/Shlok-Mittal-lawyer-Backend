
const Notification = require('../models/notification.model');
const User = require("../models/user.model");
exports.createNotification = async (req, res) => {
    try {
        let id = await reffralCode();
        const findAdmin = await User.findOne({ userType: "ADMIN" })
        if (req.body.userType === "LAWYER") {
            await notificationFunction(req.body.message, req.body.title, req.body.userType, id, req.body.isEnable, req.body.date)
        } else if (req.body.userType === "CUSTOMER") {
            await notificationFunction(req.body.message, req.body.title, req.body.userType, id, req.body.isEnable, req.body.date)
        } else {
            await notificationFunction(req.body.message, req.body.title, req.body.userType, id, req.body.isEnable, req.body.date)
        }
        const notification = await Notification.create({
            message: req.body.message,
            title: req.body.title,
            date: req.body.date,
            userId: findAdmin._id,
            isRead: false,
            id: id,
            isEnable: req.body.isEnable
        })
        return res.status(201).json({ status: 200, message: 'Notification sent successfully.', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.read = true;
        await notification.save()
        return res.status(200).json({ status: 200, message: 'Notification found successfully.', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.status(200).json({ status: 200, message: 'Notification found successfully.', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAllNotifications = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ _id: req.user._id })
        if (!findAdmin) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            if (findAdmin.userType === "ADMIN") {
                const notification = await Notification.find({ userId: req.user._id, }).sort({ updatedAt: -1 });
                if (!notification || notification.length === 0) {
                    return res.status(404).json({ message: 'Notification not found' });
                }
                return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
            } else {
                const notification = await Notification.find({ userId: req.user._id, isEnable: true }).sort({ updatedAt: -1 });
                if (!notification || notification.length === 0) {
                    return res.status(404).json({ message: 'Notification not found' });
                }
                return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
            }
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateNotification = async (req, res) => {
    try {
        const notification1 = await Notification.findById({ _id: req.params.id });
        if (!notification1) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        const notification = await Notification.findByIdAndUpdate({ _id: notification1._id }, { $set: { message: req.body.message, title: req.body.title, } }, { new: true });
        if (notification) {
            return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.status(200).json({ status: 200, message: 'Notification deleted successfully', data: {} });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateIsEnableNotification = async (req, res) => {
    try {
        const notification1 = await Notification.findOne({ id: req.params.id });
        if (!notification1) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await notificationIsEnable(notification1.id);
        const notification = await Notification.findByIdAndUpdate({ _id: notification1._id }, { $set: { isEnable: true, } }, { new: true });
        return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
const notificationIsEnable = async (id) => {
    const findLawyer = await Notification.find({ id: id });
    if (findLawyer.length > 0) {
        for (let i = 0; i < findLawyer.length; i++) {
            const notification = await Notification.findByIdAndUpdate({ _id: findLawyer[i]._id }, { $set: { isEnable: true, } }, { new: true });
        }
    }
}
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}
const notificationFunction = async (message, title, userType, id, isEnable, date) => {
    if (userType == 'All') {
        const findLawyer = await User.find({ userType: { $ne: "ADMIN" } });
        if (findLawyer.length > 0) {
            for (let i = 0; i < findLawyer.length; i++) {
                const notification = await Notification.create({
                    message: message,
                    title: title,
                    userId: findLawyer[i]._id,
                    isRead: false,
                    id: id,
                    date: date,
                    isEnable: isEnable
                })
            }
        }
    } else {
        const findLawyer = await User.find({ userType: userType });
        if (findLawyer.length > 0) {
            for (let i = 0; i < findLawyer.length; i++) {
                const notification = await Notification.create({
                    message: message,
                    title: title,
                    userId: findLawyer[i]._id,
                    isRead: false,
                    id: id,
                    date: date,
                    isEnable: isEnable
                })
            }
        }
    }
}
