const { 
  register, 
  login, 
  companyRegister, 
  companyLogin,
  getCurrentUser,
  getCompanyInfo,
  updateCompanyProfile
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = require("express").Router();

// Company routes
router.post("/company/register", companyRegister);
router.post("/company/login", companyLogin);
router.get("/company/profile", auth, getCompanyInfo);
router.put("/company/profile", auth, updateCompanyProfile);

// Team member routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);

module.exports = router;