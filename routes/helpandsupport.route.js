const express = require('express');
const help = require('../controllers/helpandsupport');
const { authJwt } = require("../middlewares");
module.exports = (app) => {
        app.post("/api/v1/help/createQuery", help.AddQuery);
        app.get("/api/v1/admin/help", help.getAllHelpandSupport);
        app.get("/api/v1/admin/help/:id", help.getAllHelpandSupportgetByuserId);
        app.delete("/api/v1/help/delete/:id", help.DeleteHelpandSupport);
};