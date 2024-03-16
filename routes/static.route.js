const { validateUser } = require("../middlewares");
const auth = require("../controllers/terms.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/admin/Term/add", [authJwt.verifyToken], auth.createTerm);
    app.get("/api/v1/Term/all", auth.getAllTerms);
    app.get("/api/v1/Term/get/:id", auth.getTermById);
    app.delete("/api/v1/Term/delete/:id", auth.deleteTerm);
    app.put("/api/v1/Term/update/:id", [authJwt.verifyToken], auth.updateTerm);
    app.post("/api/v1/privacy/add", [authJwt.verifyToken], auth.createPrivacyPolicy);
    app.get("/api/v1/privacy/all", auth.getAllPrivacyPolicy);
    app.get("/api/v1/privacy/get/:id", auth.getPrivacyPolicyById);
    app.delete("/api/v1/privacy/delete/:id", auth.deletePrivacyPolicy);
    app.put("/api/v1/privacy/update/:id", [authJwt.verifyToken], auth.updatePrivacyPolicy);
};