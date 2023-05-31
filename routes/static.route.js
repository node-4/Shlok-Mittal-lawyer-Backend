const { validateUser } = require("../middlewares");
const auth = require("../controllers/terms.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({destination: (req, file, cb) => {cb(null, "uploads");},filename: (req, file, cb) => {cb(null, Date.now() + path.extname(file.originalname));},
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("admin/Term/add", [authJwt.verifyToken], auth.createTerm);
    app.get("admin/Term/all", auth.getAllTerms);
    app.get("admin/Term/get/:id", auth.getTermById);
    app.delete("admin/Term/delete/:id", auth.deleteTerm);
    app.put("admin/Term/update", [authJwt.verifyToken], auth.updateTerm);
    app.post("admin/privacy/add", [authJwt.verifyToken], auth.createPrivacyPolicy);
    app.get("admin/privacy/all", auth.getAllPrivacyPolicy);
    app.get("admin/privacy/get/:id", auth.getPrivacyPolicyById);
    app.delete("admin/privacy/delete/:id", auth.deletePrivacyPolicy);
    app.put("admin/privacy/update", [authJwt.verifyToken], auth.updatePrivacyPolicy);
};