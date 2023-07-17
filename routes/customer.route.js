const { validateUser } = require("../middlewares");
const auth = require("../controllers/customer.controller");
const wallet = require("../controllers/wallet.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: "dbrvq9uxa",
    api_key: "567113285751718",
    api_secret: "rjTsz9ksqzlDtsrlOPcTs_-QtW4",
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "images/image",
        allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
    },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/customer/registration", auth.registration);
    app.post("/api/v1/customer/login", auth.loginWithPhone);
    app.post("/api/v1/customer/signin", [validateUser.signInBody], auth.signin);
    app.post("/api/v1/customer/:id", auth.verifyOtp);
    app.get("/api/v1/customer/resendotp/:id", auth.resendOTP);
    app.put("/api/v1/customer/resetPassword/:id", auth.resetPassword);
    app.get("/api/v1/customer/allLawyer", auth.getLawyers);
    app.get("/api/v1/customer/getLawyersbyCategory/:categoryId", auth.getLawyersbyCategory);
    app.put("/api/v1/customer/update", [authJwt.verifyToken], upload.single("image"), auth.update);
    app.get("/api/v1/customer/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/customer/saveDocument/:id", [authJwt.verifyToken], auth.SaveDocument);
    app.get("/api/v1/customer/getSaveDocument", [authJwt.verifyToken], auth.getSaveDocument);
    app.post("/api/v1/customer/createAppointment", [authJwt.verifyToken], auth.createAppointment);
    app.post("/api/v1/customer/cancelAppointment/:id", [authJwt.verifyToken], auth.cancelAppointment);
    app.get("/api/v1/customer/pastAppointment", [authJwt.verifyToken], auth.pastAppointment);
    app.get("/api/v1/customer/allCancelAppointment", [authJwt.verifyToken], auth.allCancelAppointment);
    app.get("/api/v1/customer/upcomingAppointment", [authJwt.verifyToken], auth.upcomingAppointment);
    app.get("/api/v1/customer/Bill/all", [authJwt.verifyToken], auth.getAllbill);
    app.post("/api/v1/customer/giveRating/:id", [authJwt.verifyToken], auth.giveRating)
    app.post("/api/v1/user/addMoney", [authJwt.verifyToken], wallet.addMoney);
    app.post("/api/v1/user/removeMoney", [authJwt.verifyToken], wallet.removeMoney);
    app.get("/api/v1/user/getWallet", [authJwt.verifyToken], wallet.getWallet);
    app.get("/api/v1/user/allTransactionUser", [authJwt.verifyToken], wallet.allTransactionUser);
    app.get("/api/v1/user/allcreditTransactionUser", [authJwt.verifyToken], wallet.allcreditTransactionUser);
    app.get("/api/v1/user/allDebitTransactionUser", [authJwt.verifyToken], wallet.allDebitTransactionUser);
    app.get("/api/v1/customer/getCase", [authJwt.verifyToken], auth.getCase);
    app.get("/api/v1/customer/getrefferalCode", [authJwt.verifyToken], auth.getrefferalCode);
    app.get("/api/v1/customer/getmyLawyer", [authJwt.verifyToken], auth.getAllLawyer);
    app.get("/api/v1/customer/getLawyersbyRating/:rating", auth.getLawyersbyRating);

};
