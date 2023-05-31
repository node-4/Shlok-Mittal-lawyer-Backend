const router = require("express").Router();
const document = require("../controllers/documentController");
const { authJwt, authorizeRoles } = require("../middlewares");
module.exports = (app) => {
    app.post("lawyer/document/add",[authJwt.verifyToken],document.AddDocument);
    app.get("lawyer/document/all", [authJwt.verifyToken], document.getDocument);
    app.get("customer/document/all", document.getAllDocument);
    app.get("lawyer/document/get/:id", document.getById);
    app.delete("lawyer/document/delete/:id", document.DeleteDocument);
};
