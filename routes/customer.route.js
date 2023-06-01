const { validateUser } = require("../middlewares");
const auth = require("../controllers/customer.controller");
const { authJwt, authorizeRoles } = require("../middlewares");

module.exports = (app) => {
    app.post("/api/v1/customer/registration", auth.registration);
    app.post("/api/v1/customer/login", auth.loginWithPhone);
    app.post("/api/v1/customer/signin", [validateUser.signInBody], auth.signin);
    app.post("/api/v1/customer/:id", auth.verifyOtp);
    app.get("/api/v1/customer/resendotp/:id", auth.resendOTP);
    app.put("/api/v1/customer/resetPassword/:id", auth.resetPassword);
    app.get("/api/v1/customer/allLawyer", auth.getLawyers);
    app.put("/api/v1/customer/update",  [authJwt.verifyToken], auth.update);
    app.post("/api/v1/customer/saveDocument/:id",  [authJwt.verifyToken], auth.SaveDocument);
    app.post("/api/v1/customer/createAppointment/:id",  [authJwt.verifyToken], auth.createAppointment);
    app.get("/api/v1/customer/pastAppointment",  [authJwt.verifyToken], auth.pastAppointment);
    app.get("/api/v1/customer/cancelAppointment",  [authJwt.verifyToken], auth.cancelAppointment);
    app.get("/api/v1/customer/upcomingAppointment",  [authJwt.verifyToken], auth.upcomingAppointment);
    app.get("/api/v1/customer/Bill/all",  [authJwt.verifyToken],auth.getAllbill);
};
