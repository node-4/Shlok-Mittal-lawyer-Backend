
const notificationsController = require('../controllers/notification.controller');
const { authJwt, objectId } = require('../middlewares');

// GET all notifications and conditions
module.exports = (app) => {
    app.get('admin/notifications', notificationsController.getAllNotifications);

    // GET a single term and condition by ID
    app.get('admin/notifications/:id',  notificationsController.getById);

    // CREATE a new term and condition
    app.post('admin/notifications', [authJwt.isAdmin], notificationsController.createNotification);

    // UPDATE a term and condition by ID
    app.put('admin/notifications/:id', [authJwt.isAdmin, objectId.validId], notificationsController.updateNotification);

    // DELETE a term and condition by ID
    app.delete('admin/notifications/:id', [authJwt.isAdmin, objectId.validId], notificationsController.deleteNotification);

    // users
    app.get('notifications', notificationsController.getAllNotifications);

    // GET a single term and condition by ID
    app.get('notifications/:id', notificationsController.getById);
}

