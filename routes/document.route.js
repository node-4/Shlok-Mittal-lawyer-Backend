const router = require("express").Router();
const document = require("../controllers/documentController");
const { authJwt, authorizeRoles } = require("../middlewares");
module.exports = (app) => {
    app.post("/api/v1/lawyer/document/add",[authJwt.verifyToken],document.AddDocument);
    app.get("/api/v1/lawyer/document/all", [authJwt.verifyToken], document.getDocument);
    app.get("/api/v1/customer/document/all", document.getAllDocument);
    app.get("/api/v1/lawyer/document/get/:id", document.getById);
    app.delete("/api/v1/lawyer/document/delete/:id", document.DeleteDocument);
};
