const express = require('express');
const help = require('../controllers/helpandsupport');
const { authJwt } = require("../middlewares");
module.exports = (app) => {
app.post('help/createQuery', [authJwt.verifyToken], help.AddQuery);
app.get('admin/help', help.getAllHelpandSupport);
app.get('admin/help/:id', help.getAllHelpandSupportgetByuserId);
app.delete('help/delete/:id', help.DeleteHelpandSupport);
};