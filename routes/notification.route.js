
const notificationsController = require('../controllers/notification.controller');
const { authJwt, objectId } = require('../middlewares');

// GET all notifications and conditions
module.exports = (app) => {
    app.get('/api/v1/admin/notifications', notificationsController.getAllNotifications);
    app.get('/api/v1/admin/notifications/:id', notificationsController.getById);
    app.post('/api/v1/admin/notifications', [authJwt.verifyToken], notificationsController.createNotification);
    app.put('/api/v1/admin/notifications/:id', [authJwt.verifyToken, objectId.validId], notificationsController.updateNotification);
    app.delete('/api/v1/admin/notifications/:id', [authJwt.verifyToken, objectId.validId], notificationsController.deleteNotification);
}

