const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({destination: (req, file, cb) => {cb(null, "uploads");},filename: (req, file, cb) => {cb(null, Date.now() + path.extname(file.originalname));},
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("admin/registration", auth.registration);
    app.post("admin/login", auth.signin);
    app.put("admin/update",  [authJwt.verifyToken], auth.update);
    app.get("admin/dashboard",  [authJwt.verifyToken], auth.dashboard);
    app.get("admin/users",  [authJwt.verifyToken], auth.getUsers);
    app.get("admin/lawyer",  [authJwt.verifyToken], auth.getLawyers);
    app.post("admin/createCategory",[authJwt.verifyToken],auth.createCategory);
    app.post("admin/category", auth.getCategory);
    app.get("admin/category/:id", auth.getCategoryId);
    app.patch("admin/category/:id",[authJwt.verifyToken],auth.updateCategory);
    app.delete("admin/category/:id",[authJwt.verifyToken],auth.deleteCategory);
    app.post("admin/createDepartment",[authJwt.verifyToken],auth.createDepartment);
    app.post("admin/department", auth.getDepartment);
    app.get("admin/department/:id", auth.getDepartmentId);
    app.patch("admin/department/:id",[authJwt.verifyToken],auth.updateDepartment);
    app.delete("admin/department/:id",[authJwt.verifyToken],auth.deleteDepartment);
    app.post("admin/createService",[authJwt.verifyToken],auth.createService);
    app.post("admin/service", auth.getService);
    app.get("admin/service/:id", auth.getServiceId);
    app.patch("admin/service/:id",[authJwt.verifyToken],auth.updateService);
    app.delete("admin/service/:id",[authJwt.verifyToken],auth.deleteService);
    app.post("admin/createLocation",[authJwt.verifyToken],auth.createLocation);
    app.post("admin/location", auth.getLocation);
    app.get("admin/location/:id", auth.getLocationId);
    app.patch("admin/location/:id",[authJwt.verifyToken],auth.updateLocation);
    app.delete("admin/location/:id",[authJwt.verifyToken],auth.deleteLocation);
    app.post("admin/CreateLawyer",[authJwt.verifyToken],auth.CreateLawyer);
    app.put("admin/updateLawyer/:id",[authJwt.verifyToken],auth.updateLawyer);
    app.delete("admin/User/:id",[authJwt.verifyToken],auth.deleteUser);
    app.post('admin/CreateBanner', auth.AddBanner );
    app.get('admin/AllBanner', auth.getBanner);
    app.get('admin/banner/:id', auth.getByIdBanner);
    app.delete('admin/delete/:id', auth.DeleteBanner);
    app.post("admin/createCourtCategory",[authJwt.verifyToken],auth.createCourtCategory);
    app.post("admin/CourtCategory", auth.getCourtCategory);
    app.get("admin/CourtCategory/:id", auth.getCourtCategoryId);
    app.patch("admin/CourtCategory/:id",[authJwt.verifyToken],auth.updateCourtCategory);
    app.delete("admin/CourtCategory/:id",[authJwt.verifyToken],auth.deleteCourtCategory);
    app.post("admin/createCaseCategory",[authJwt.verifyToken],auth.createCaseCategory);
    app.post("admin/CaseCategory", auth.getCaseCategory);
    app.get("admin/CaseCategory/:id", auth.getCaseCategoryId);
    app.patch("admin/CaseCategory/:id",[authJwt.verifyToken],auth.updateCaseCategory);
    app.delete("admin/CaseCategory/:id",[authJwt.verifyToken],auth.deleteCaseCategory);
    app.post("admin/case/add", [authJwt.verifyToken], auth.createCase);
    app.get("admin/case/all", auth.getCase);
    app.get("admin/case/get/:id", auth.getIdCase);
    app.delete("admin/case/delete/:id", auth.deleteCase);
    app.put("admin/case/update", [authJwt.verifyToken], auth.updateCase);
    app.post("admin/court/add", [authJwt.verifyToken], auth.createCourt);
    app.get("admin/court/all", auth.getCourt);
    app.get("admin/court/get/:id", auth.getCourtId);
    app.delete("admin/court/delete/:id", auth.deleteCourt);
    app.put("admin/court/update", [authJwt.verifyToken], auth.updateCourt);
};