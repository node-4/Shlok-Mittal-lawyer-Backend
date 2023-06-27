const { validateUser } = require("../middlewares");
const auth = require("../controllers/lawyer.controller");
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
var cpUpload = upload.fields([{ name: 'barRegistrationImage', maxCount: 1 },
 { name: 'barCertificateImage', maxCount: 1 }, 
 { name: 'aadhar', maxCount: 1 }]);


module.exports = (app) => {
    app.post("/api/v1/lawyer/registration",cpUpload, auth.registration);
    app.post("/api/v1/lawyer/login", auth.loginWithPhone);
    app.post("/api/v1/lawyer/signin", [validateUser.signInBody], auth.signin);
    app.post("/api/v1/lawyer/:id", auth.verifyOtp);
    app.post("/api/v1/lawyer/resendotp/:id", auth.resendOTP);
    app.put("/api/v1/lawyer/resetPassword", auth.resetPassword);
    app.put("/api/v1/lawyer/update", [authJwt.verifyToken], upload.single("image"),auth.update);
    app.put("/api/v1/lawyer/updateProfile/:id", auth.updateProfile);
    app.get("/api/v1/lawyer/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/lawyer/case/add", [authJwt.verifyToken], auth.createCase);
    app.post("/api/v1/lawyer/case/addNote/:id", [authJwt.verifyToken], auth.addNote);
    app.get("/api/v1/lawyer/case/all", [authJwt.verifyToken], auth.getCase);
    app.get("/api/v1/lawyer/case/all/:caseStatus", [authJwt.verifyToken], auth.getCase);
    app.get("/api/v1/lawyer/case/upcommingCase", [authJwt.verifyToken], auth.upcommingCase);
    app.get("/api/v1/lawyer/pastAppointment",  [authJwt.verifyToken], auth.pastAppointment);
    app.get("/api/v1/lawyer/allCancelAppointment",  [authJwt.verifyToken], auth.allCancelAppointment);
    app.get("/api/v1/lawyer/upcomingAppointment",  [authJwt.verifyToken], auth.upcomingAppointment);
    app.get("/api/v1/lawyer/case/get/:id", auth.getIdCase);
    app.delete("/api/v1/lawyer/case/delete/:id", auth.deleteCase);
    app.put("/api/v1/lawyer/case/update/:id", [authJwt.verifyToken], auth.updateCase);
    app.put("/api/v1/lawyer/addskill", [authJwt.verifyToken], auth.addskill);
    app.get("/api/v1/lawyer/skillExpertise", [authJwt.verifyToken], auth.skillExpertise);
    app.put("/api/v1/lawyer/addExpertise", [authJwt.verifyToken], auth.addExpertise);
    app.post("/api/v1/wallet/addMoney", [authJwt.verifyToken], wallet.addMoney);
    app.post("/api/v1/wallet/removeMoney", [authJwt.verifyToken], wallet.removeMoney);
    app.get("/api/v1/wallet/getWallet", [authJwt.verifyToken], wallet.getWallet);
    app.get("/api/v1/lawyer/allTransactionUser", [authJwt.verifyToken], wallet.allTransactionUser);
    app.get("/api/v1/lawyer/allcreditTransactionUser", [authJwt.verifyToken], wallet.allcreditTransactionUser);
    app.get("/api/v1/lawyer/allDebitTransactionUser", [authJwt.verifyToken], wallet.allDebitTransactionUser);
    app.post("/api/v1/lawyer/createBill/:userId", [authJwt.verifyToken], auth.createBill);
    app.get("/api/v1/lawyer/Bill/all", [authJwt.verifyToken], auth.getAllbill);
    app.get("/api/v1/lawyer/rating/all", [authJwt.verifyToken], auth.getAllRating);
    app.get("/api/v1/lawyer/getrefferalCode",  [authJwt.verifyToken], auth.getrefferalCode);

};
