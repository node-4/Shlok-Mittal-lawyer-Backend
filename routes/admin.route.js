const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const blog = require("../controllers/blog");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "dbrvq9uxa", api_key: "567113285751718", api_secret: "rjTsz9ksqzlDtsrlOPcTs_-QtW4", });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "images/image", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'barRegistrationImage', maxCount: 1 }, { name: 'barCertificateImage', maxCount: 1 }, { name: 'aadhar', maxCount: 1 }]);
var cp1Upload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'descriptionImage', maxCount: 10 }]);
module.exports = (app) => {
    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
    app.get("/api/v1/admin/dashboard", [authJwt.verifyToken], auth.dashboard);
    app.get("/api/v1/admin/lawyer", [authJwt.verifyToken], auth.getLawyers);
    app.post("/api/v1/admin/CreateLawyer", [authJwt.verifyToken], cpUpload, auth.CreateLawyer);
    app.put("/api/v1/admin/updateLawyer/:id", [authJwt.verifyToken], cpUpload, auth.updateLawyer);
    app.get("/api/v1/admin/users", [authJwt.verifyToken], auth.getUsers);
    app.delete("/api/v1/admin/User/:id", [authJwt.verifyToken], auth.deleteUser);
    app.get("/api/v1/admin/User/:id", auth.getUserById);
    app.put("/api/v1/admin/updateUser/:id", [authJwt.verifyToken], upload.single("image"), auth.updateUser);
    app.post("/api/v1/admin/case/add", [authJwt.verifyToken], auth.createCase);
    app.get("/api/v1/admin/case/all", auth.getCase);
    app.get("/api/v1/admin/OldCase/all", auth.getOldCase);
    app.get("/api/v1/admin/NewCase/all", auth.getNewCase);
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
    app.get("/api/v1/admin/location/ByToken", [authJwt.verifyToken], auth.getLocationByUser);
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
    app.post("/api/v1/admin/createService", [authJwt.verifyToken], upload.single("image"), auth.createService);
    app.get("/api/v1/admin/service", auth.getService);
    app.get("/api/v1/admin/service/:id", auth.getServiceId);
    app.patch("/api/v1/admin/service/:id", [authJwt.verifyToken], upload.single("image"), auth.updateService);
    app.delete("/api/v1/admin/service/:id", [authJwt.verifyToken], auth.deleteService);
    app.post("/api/v1/admin/CreateStaff", [authJwt.verifyToken], auth.CreateStaff);
    app.get("/api/v1/admin/getStaff", auth.getStaff);
    app.patch("/api/v1/admin/updateStaff/:id", auth.updateStaff);
    app.post("/api/v1/BlogCategory/createBlogCategory", upload.single('image'), blog.createBlogCategory);
    app.get("/api/v1/BlogCategory/getBlogCategory", blog.getBlogCategory);
    app.get("/api/v1/BlogCategory/getIdBlogCategory/:id", blog.getIdBlogCategory);
    app.put("/api/v1/BlogCategory/updateBlogCategory/:id", upload.single('image'), blog.updateBlogCategory);
    app.delete("/api/v1/BlogCategory/deleteBlogCategory/:id", blog.deleteBlogCategory);
    app.post("/api/v1/Blog/createBlog", upload.single('image'), blog.createBlog);
    app.get("/api/v1/Blog/getBlog", blog.getBlog);
    app.get("/api/v1/Blog/getIdBlog/:id", blog.getIdBlog);
    app.delete("/api/v1/Blog/deleteBlog/:id", blog.deleteBlog);
    app.get("/api/v1/Blog/getBlogPopular", blog.getBlogPopular);
    app.put("/api/v1/Blog/updateBlog/:id", upload.single('image'), blog.updateBlog);
    app.put("/api/v1/Blog/assignCategoryToCity/:id", blog.assignCategoryToCity);
    app.post("/api/v1/Blog/createWhyUserLove", upload.single('image'), blog.createWhyUserLove);
    app.get("/api/v1/Blog/getWhyUserLove", blog.getWhyUserLove);
    app.get("/api/v1/Blog/getIdWhyUserLove/:id", blog.getIdWhyUserLove);
    app.delete("/api/v1/Blog/deleteWhyUserLove/:id", blog.deleteWhyUserLove);
    app.put("/api/v1/Blog/updateWhyUserLove/:id", upload.single('image'), blog.updateWhyUserLove);
    app.post("/api/v1/Blog/createTrustedBy", upload.single('image'), blog.createTrustedBy);
    app.get("/api/v1/Blog/getTrusted", blog.getTrusted);
    app.get("/api/v1/Blog/getIdTrustedBy/:id", blog.getIdTrustedBy);
    app.delete("/api/v1/Blog/deleteTrustedBy/:id", blog.deleteTrustedBy);
    app.put("/api/v1/Blog/updateTrustedBy/:id", upload.single('image'), blog.updateTrustedBy);
    app.post("/api/v1/Blog/createCaseManager", cp1Upload, blog.createCaseManager);
    app.get("/api/v1/Blog/getCaseManager", blog.getCaseManager);
    app.get("/api/v1/Blog/getIdCaseManager/:id", blog.getIdCaseManager);
    app.delete("/api/v1/Blog/deleteCaseManager/:id", blog.deleteCaseManager);
    app.put("/api/v1/Blog/updateCaseManager/:id", cp1Upload, blog.updateCaseManager);
    app.post("/api/v1/City/createCity", upload.single('image'), blog.createCity);
    app.get("/api/v1/City/getCity", blog.getCity);
    app.get("/api/v1/City/getIdCity/:id", blog.getIdCity);
    app.put("/api/v1/City/updateCity/:id", upload.single('image'), blog.updateCity);
    app.delete("/api/v1/City/deleteCity/:id", blog.deleteCity);
    app.get("/api/v1/City/getCityPopular", blog.getCityPopular);
    app.post("/api/v1/Faq/createFaq", blog.createFaq);
    app.get("/api/v1/Faq/getFaq", blog.getFaq);
    app.get("/api/v1/Faq/getFaqById/:id", blog.getFaqById);
    app.put("/api/v1/Faq/updateFaq/:id", blog.updateFaq);
    app.delete("/api/v1/Faq/deleteFaq/:id", blog.deleteFaq);
};