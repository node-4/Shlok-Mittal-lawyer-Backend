const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
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
    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
    app.get("/api/v1/admin/dashboard", [authJwt.verifyToken], auth.dashboard);
    app.get("/api/v1/admin/lawyer", [authJwt.verifyToken], auth.getLawyers);
    app.post("/api/v1/admin/CreateLawyer", [authJwt.verifyToken], cpUpload, auth.CreateLawyer);
    app.put("/api/v1/admin/updateLawyer/:id", [authJwt.verifyToken], auth.updateLawyer);
    app.get("/api/v1/admin/users", [authJwt.verifyToken], auth.getUsers);
    app.delete("/api/v1/admin/User/:id", [authJwt.verifyToken], auth.deleteUser);
    app.get("/api/v1/admin/User/:id", auth.getUserById);
    app.put("/api/v1/admin/updateUser/:id", [authJwt.verifyToken], upload.single("image"), auth.updateUser);
    app.post("/api/v1/admin/case/add", [authJwt.verifyToken], auth.createCase);
    app.get("/api/v1/admin/case/all", auth.getCase);
    app.get("/api/v1/admin/case/getClosed", auth.getClosedCase);
    app.get("/api/v1/admin/case/get/:id", auth.getIdCase);
    app.delete("/api/v1/admin/case/delete/:id", auth.deleteCase);
    app.put("/api/v1/admin/case/update/:id", [authJwt.verifyToken], auth.updateCase);
    app.post("/api/v1/admin/createDepartment", [authJwt.verifyToken], auth.createDepartment);
    app.post("/api/v1/admin/department", auth.getDepartment);
    app.get("/api/v1/admin/department/:id", auth.getDepartmentId);
    app.patch("/api/v1/admin/department/:id", [authJwt.verifyToken], auth.updateDepartment);
    app.delete("/api/v1/admin/department/:id", [authJwt.verifyToken], auth.deleteDepartment);
    app.post("/api/v1/createCategory", [authJwt.verifyToken], upload.single("image"), auth.createCategory);
    app.get("/api/v1/category", auth.getCategory);
    app.get("/api/v1/category/:id", auth.getCategoryId);
    app.patch("/api/v1/category/:id", [authJwt.verifyToken], upload.single("image"), auth.updateCategory);
    app.delete("/api/v1/category/:id", [authJwt.verifyToken], auth.deleteCategory);
    app.post('/api/v1/admin/CreateBanner', upload.single("image"), auth.AddBanner);
    app.get('/api/v1/admin/AllBanner', auth.getBanner);
    app.put('/api/v1/admin/updateBanner/:id', upload.single("image"), auth.updateBanner);
    app.get('/api/v1/admin/banner/:id', auth.getByIdBanner);
    app.delete('/api/v1/admin/delete/:id', auth.DeleteBanner);
    app.post("/api/v1/admin/createLocation", [authJwt.verifyToken], auth.createLocation);
    app.post("/api/v1/admin/location", auth.getLocation);
    app.get("/api/v1/admin/location/:id", auth.getLocationId);
    app.patch("/api/v1/admin/location/:id", [authJwt.verifyToken], auth.updateLocation);
    app.delete("/api/v1/admin/location/:id", [authJwt.verifyToken], auth.deleteLocation);
    app.post("/api/v1/admin/createCourtCategory", [authJwt.verifyToken], auth.createCourtCategory);
    app.post("/api/v1/admin/CourtCategory", auth.getCourtCategory);
    app.get("/api/v1/admin/CourtCategory/:id", auth.getCourtCategoryId);
    app.patch("/api/v1/admin/CourtCategory/:id", [authJwt.verifyToken], auth.updateCourtCategory);
    app.delete("/api/v1/admin/CourtCategory/:id", [authJwt.verifyToken], auth.deleteCourtCategory);
    app.post("/api/v1/admin/createCaseCategory", [authJwt.verifyToken], auth.createCaseCategory);
    app.post("/api/v1/admin/CaseCategory", auth.getCaseCategory);
    app.get("/api/v1/admin/CaseCategory/:id", auth.getCaseCategoryId);
    app.patch("/api/v1/admin/CaseCategory/:id", [authJwt.verifyToken], auth.updateCaseCategory);
    app.delete("/api/v1/admin/CaseCategory/:id", [authJwt.verifyToken], auth.deleteCaseCategory);
    app.post("/api/v1/admin/court/add", [authJwt.verifyToken], auth.createCourt);
    app.get("/api/v1/admin/court/all", auth.getCourt);
    app.get("/api/v1/admin/court/get/:id", auth.getCourtId);
    app.delete("/api/v1/admin/court/delete/:id", auth.deleteCourt);
    app.put("/api/v1/admin/court/update", [authJwt.verifyToken], auth.updateCourt);
    app.post("/api/v1/admin/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
    app.get("/api/v1/viewContactDetails", auth.viewContactDetails);
    app.get("/api/v1/admin/pastAppointment", auth.pastAppointment);
    app.get("/api/v1/admin/allCancelAppointment", auth.allCancelAppointment);
    app.get("/api/v1/admin/upcomingAppointment", auth.upcomingAppointment);
    app.get("/api/v1/admin/getSaveDocument", auth.getSaveDocument);


    app.post("/api/v1/admin/createService", [authJwt.verifyToken], auth.createService);
    app.get("/api/v1/admin/service", auth.getService);
    app.get("/api/v1/admin/service/:id", auth.getServiceId);
    app.patch("/api/v1/admin/service/:id", [authJwt.verifyToken], auth.updateService);
    app.delete("/api/v1/admin/service/:id", [authJwt.verifyToken], auth.deleteService);
};