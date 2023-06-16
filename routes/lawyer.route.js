const { validateUser } = require("../middlewares");
const auth = require("../controllers/lawyer.controller");
const wallet = require("../controllers/wallet.controller");
const { authJwt, authorizeRoles } = require("../middlewares");

module.exports = (app) => {
    app.post("/api/v1/lawyer/registration", auth.registration);
    app.post("/api/v1/lawyer/login", auth.loginWithPhone);
    app.post("/api/v1/lawyer/signin", [validateUser.signInBody], auth.signin);
    app.post("/api/v1/lawyer/:id", auth.verifyOtp);
    app.post("/api/v1/lawyer/resendotp/:id", auth.resendOTP);
    app.put("/api/v1/lawyer/resetPassword", auth.resetPassword);
    app.put("/api/v1/lawyer/update", [authJwt.verifyToken], auth.update);
    app.post("/api/v1/lawyer/case/add", [authJwt.verifyToken], auth.createCase);
    app.get("/api/v1/lawyer/case/all", auth.getCase);
    app.get("/api/v1/lawyer/case/all/:lawyer", auth.upcommingCase);
    app.get("/api/v1/lawyer/case/get/:id", auth.getIdCase);
    app.delete("/api/v1/lawyer/case/delete/:id", auth.deleteCase);
    app.put("/api/v1/lawyer/case/update/:id", [authJwt.verifyToken], auth.updateCase);
    app.put("/api/v1/lawyer/addskill", [authJwt.verifyToken], auth.addskill);
    app.get("/api/v1/lawyer/skillExpertise", [authJwt.verifyToken], auth.skillExpertise);
    app.put("/api/v1/lawyer/addExpertise", [authJwt.verifyToken], auth.addExpertise);
    app.post("/api/v1/wallet/addMoney", [authJwt.verifyToken], wallet.addMoney);
    app.post("/api/v1/wallet/removeMoney", [authJwt.verifyToken], wallet.removeMoney);
    app.get("/api/v1/wallet/getWallet", [authJwt.verifyToken], wallet.getWallet);
    app.post("/api/v1/lawyer/createBill/:userId", [authJwt.verifyToken], auth.createBill);
    app.get("/api/v1/lawyer/Bill/all",  [authJwt.verifyToken],auth.getAllbill);

};
