const { validateUser } = require("../middlewares");
const auth = require("../controllers/lawyer.controller");
const wallet = require("../controllers/wallet.controller");
const { authJwt, authorizeRoles } = require("../middlewares");

module.exports = (app) => {
    app.post("lawyer/registration", auth.registration);
    app.post("lawyer/login", auth.loginWithPhone);
    app.post("lawyer/signin", [validateUser.signInBody], auth.signin);
    app.post("lawyer/:id", auth.verifyOtp);
    app.get("lawyer/resendotp/:id", auth.resendOTP);
    app.put("lawyer/resetPassword/:id", auth.resetPassword);
    app.put("lawyer/update", [authJwt.verifyToken], auth.update);
    router.post("lawyer/case/add", [authJwt.verifyToken], auth.createCase);
    router.get("lawyer/case/all", auth.getCase);
    router.get("lawyer/case/get/:id", auth.getIdCase);
    router.delete("lawyer/case/delete/:id", auth.deleteCase);
    app.put("lawyer/case/update", [authJwt.verifyToken], auth.updateCase);
    app.put("lawyer/addskill", [authJwt.verifyToken], auth.addskill);
    app.post("lawyer/createBill/:userId", [authJwt.verifyToken], auth.createBill);
    router.get("lawyer/Bill/all",  [authJwt.verifyToken],auth.getAllbill);
    router.post("wallet/addMoney", [authJwt.verifyToken], wallet.addMoney);
    router.post("wallet/removeMoney", [authJwt.verifyToken], wallet.removeMoney);
    router.get("wallet/getWallet", [authJwt.verifyToken], wallet.getWallet);

};
