const { validateUser } = require("../middlewares");
const auth = require("../controllers/customer.controller");
const { authJwt, authorizeRoles } = require("../middlewares");

module.exports = (app) => {
    app.post("customer/registration", auth.registration);
    app.post("customer/login", auth.loginWithPhone);
    app.post("customer/signin", [validateUser.signInBody], auth.signin);
    app.post("customer/:id", auth.verifyOtp);
    app.get("customer/resendotp/:id", auth.resendOTP);
    app.put("customer/resetPassword/:id", auth.resetPassword);
    app.get("customer/allLawyer", auth.getLawyers);
    app.put("customer/update",  [authJwt.verifyToken], auth.update);
    app.post("customer/saveDocument/:id",  [authJwt.verifyToken], auth.SaveDocument);
    app.post("customer/createAppointment",  [authJwt.verifyToken], auth.createAppointment);
    app.post("customer/pastAppointment",  [authJwt.verifyToken], auth.pastAppointment);
    app.post("customer/cancelAppointment",  [authJwt.verifyToken], auth.cancelAppointment);
    app.post("customer/upcomingAppointment",  [authJwt.verifyToken], auth.upcomingAppointment);
    router.get("customer/Bill/all",  [authJwt.verifyToken],auth.getAllbill);

};
