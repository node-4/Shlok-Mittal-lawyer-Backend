
const Notification = require('../models/notification.model');
// CREATE Notification
exports.createNotification = async (req, res) => {
    try {
        const notification = await Notification.create({
            message: req.body.message,
            title: req.body.title,
            isRead: false
        })
        return res.status(201).json({ status: 200, message: 'Notification sent successfully.', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
// READ All Notifications
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
exports.getAllNotifications = async (req, res) => {
    try {
        const notification = await Notification.find();

        if (!notification || notification.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
// UPDATE Notification
exports.updateNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, {
            message: req.body.message,
            title: req.body.title,

        }, { new: true });

        if (!notification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }
        return res.status(200).json({ status: 200, message: 'Notification found', data: notification });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server Error' });
    }
};
// DELETE Notification
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
